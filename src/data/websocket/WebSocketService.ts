/**
 * WebSocket Service
 *
 * Real-time communication service for:
 * - Live EMR updates
 * - New lab results notifications
 * - Appointment status changes
 * - Provider connection status
 *
 * Features:
 * - Auto-reconnect with exponential backoff
 * - Connection health monitoring
 * - Message queuing when offline
 * - Heartbeat/ping-pong
 */

import { AppState, AppStateStatus } from 'react-native';
import { Config } from '../../utils/config';
import { Logger } from '../../utils/logger';

// WebSocket message types
export enum WSMessageType {
  // System
  PING = 'ping',
  PONG = 'pong',
  AUTH = 'auth',
  AUTH_SUCCESS = 'auth_success',
  AUTH_FAILED = 'auth_failed',
  ERROR = 'error',

  // FHIR updates
  PATIENT_UPDATED = 'patient_updated',
  OBSERVATION_CREATED = 'observation_created',
  OBSERVATION_UPDATED = 'observation_updated',
  REPORT_CREATED = 'report_created',
  REPORT_UPDATED = 'report_updated',
  ENCOUNTER_CREATED = 'encounter_created',
  ENCOUNTER_UPDATED = 'encounter_updated',
  MEDICATION_UPDATED = 'medication_updated',

  // Appointments
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',

  // Provider
  PROVIDER_CONNECTED = 'provider_connected',
  PROVIDER_DISCONNECTED = 'provider_disconnected',

  // Consent
  CONSENT_REQUESTED = 'consent_requested',
  CONSENT_REVOKED = 'consent_revoked',

  // Subscriptions
  SUBSCRIBE = 'subscribe',
  UNSUBSCRIBE = 'unsubscribe',
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBED = 'unsubscribed',
}

export interface WSMessage<T = unknown> {
  type: WSMessageType;
  payload?: T;
  timestamp: string;
  messageId: string;
  providerId?: string;
}

export interface WSEventPayload {
  resourceType: string;
  resourceId: string;
  action: 'created' | 'updated' | 'deleted';
  resource?: Record<string, unknown>;
}

type MessageHandler<T = unknown> = (message: WSMessage<T>) => void;
type ConnectionHandler = (connected: boolean) => void;
type ErrorHandler = (error: Error) => void;

interface QueuedMessage {
  message: WSMessage;
  timestamp: number;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private accessToken: string | null = null;

  // Connection state
  private isConnected = false;
  private isConnecting = false;
  private isAuthenticated = false;
  private shouldReconnect = true;

  // Reconnection
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private baseReconnectDelay = 1000;
  private maxReconnectDelay = 30000;

  // Heartbeat
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatIntervalMs = 30000;
  private heartbeatTimeoutMs = 10000;
  private lastPongTime = 0;

  // Message queue (for when offline)
  private messageQueue: QueuedMessage[] = [];
  private maxQueueSize = 100;
  private maxQueueAge = 5 * 60 * 1000; // 5 minutes

  // Event handlers
  private messageHandlers: Map<WSMessageType, Set<MessageHandler>> = new Map();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();

  // Subscriptions
  private subscriptions: Set<string> = new Set();

  // App state
  private appState: AppStateStatus = 'active';
  private appStateSubscription: { remove: () => void } | null = null;

  private logger = Logger;

  constructor(url?: string) {
    this.url = url || Config.WEBSOCKET_URL;
    this.setupAppStateListener();
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Connect to WebSocket server
   */
  connect(accessToken: string): void {
    if (this.isConnected || this.isConnecting) {
      this.logger.debug('Already connected or connecting');
      return;
    }

    this.accessToken = accessToken;
    this.shouldReconnect = true;
    this.doConnect();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    this.cleanup();
  }

  /**
   * Send a message
   */
  send<T>(type: WSMessageType, payload?: T, providerId?: string): void {
    const message: WSMessage<T> = {
      type,
      payload,
      timestamp: new Date().toISOString(),
      messageId: this.generateMessageId(),
      providerId,
    };

    if (this.isConnected && this.isAuthenticated) {
      this.sendRaw(message);
    } else {
      this.queueMessage(message);
    }
  }

  /**
   * Subscribe to a resource type for updates
   */
  subscribe(resourceType: string, patientId?: string): void {
    const subscriptionKey = patientId ? `${resourceType}:${patientId}` : resourceType;

    if (this.subscriptions.has(subscriptionKey)) {
      return;
    }

    this.subscriptions.add(subscriptionKey);

    if (this.isConnected && this.isAuthenticated) {
      this.send(WSMessageType.SUBSCRIBE, {
        resourceType,
        patientId,
      });
    }
  }

  /**
   * Unsubscribe from a resource type
   */
  unsubscribe(resourceType: string, patientId?: string): void {
    const subscriptionKey = patientId ? `${resourceType}:${patientId}` : resourceType;

    this.subscriptions.delete(subscriptionKey);

    if (this.isConnected && this.isAuthenticated) {
      this.send(WSMessageType.UNSUBSCRIBE, {
        resourceType,
        patientId,
      });
    }
  }

  /**
   * Add a message handler for a specific message type
   */
  onMessage<T = unknown>(type: WSMessageType, handler: MessageHandler<T>): () => void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler as MessageHandler);

    return () => {
      this.messageHandlers.get(type)?.delete(handler as MessageHandler);
    };
  }

  /**
   * Add a connection state handler
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Add an error handler
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => {
      this.errorHandlers.delete(handler);
    };
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    authenticated: boolean;
    reconnectAttempts: number;
    queueSize: number;
    subscriptions: string[];
  } {
    return {
      connected: this.isConnected,
      authenticated: this.isAuthenticated,
      reconnectAttempts: this.reconnectAttempts,
      queueSize: this.messageQueue.length,
      subscriptions: Array.from(this.subscriptions),
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private doConnect(): void {
    if (this.isConnecting) return;

    this.isConnecting = true;
    this.logger.info('Connecting to WebSocket', { url: this.url });

    try {
      this.ws = new WebSocket(this.url);
      this.setupWebSocketHandlers();
    } catch (error) {
      this.logger.error('Failed to create WebSocket', { error });
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private setupWebSocketHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.logger.info('WebSocket connected');
      this.isConnected = true;
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Authenticate
      this.authenticate();
    };

    this.ws.onmessage = event => {
      try {
        const message = JSON.parse(event.data as string) as WSMessage;
        this.handleMessage(message);
      } catch (error) {
        this.logger.error('Failed to parse WebSocket message', { error, data: event.data });
      }
    };

    this.ws.onerror = error => {
      this.logger.error('WebSocket error', { error });
      this.notifyError(new Error('WebSocket error'));
    };

    this.ws.onclose = event => {
      this.logger.info('WebSocket closed', {
        code: event.code,
        reason: event.reason,
        wasClean: (event as { wasClean?: boolean }).wasClean ?? false,
      });

      this.isConnected = false;
      this.isConnecting = false;
      this.isAuthenticated = false;
      this.stopHeartbeat();

      this.notifyConnectionChange(false);

      if (this.shouldReconnect && this.appState === 'active') {
        this.scheduleReconnect();
      }
    };
  }

  private authenticate(): void {
    if (!this.accessToken) {
      this.logger.error('No access token for authentication');
      this.disconnect();
      return;
    }

    this.send(WSMessageType.AUTH, { token: this.accessToken });
  }

  private handleMessage(message: WSMessage): void {
    this.logger.debug('Received message', { type: message.type });

    switch (message.type) {
      case WSMessageType.AUTH_SUCCESS:
        this.handleAuthSuccess();
        break;

      case WSMessageType.AUTH_FAILED:
        this.handleAuthFailed(message);
        break;

      case WSMessageType.PONG:
        this.handlePong();
        break;

      case WSMessageType.ERROR:
        this.handleError(message);
        break;

      default: {
        // Notify registered handlers
        const handlers = this.messageHandlers.get(message.type);
        if (handlers) {
          handlers.forEach(handler => {
            try {
              handler(message);
            } catch (error) {
              this.logger.error('Handler error', { type: message.type, error });
            }
          });
        }
        break;
      }
    }
  }

  private handleAuthSuccess(): void {
    this.logger.info('WebSocket authenticated');
    this.isAuthenticated = true;
    this.notifyConnectionChange(true);

    // Start heartbeat
    this.startHeartbeat();

    // Resubscribe to previous subscriptions
    this.resubscribe();

    // Flush message queue
    this.flushMessageQueue();
  }

  private handleAuthFailed(message: WSMessage): void {
    this.logger.error('WebSocket authentication failed', { message });
    this.notifyError(new Error('Authentication failed'));
    this.disconnect();
  }

  private handlePong(): void {
    this.lastPongTime = Date.now();
    this.logger.debug('Received pong', { lastPongTime: this.lastPongTime });
    this.clearHeartbeatTimeout();
  }

  private handleError(message: WSMessage): void {
    this.logger.error('Server error', { message });
    this.notifyError(
      new Error((message.payload as { message?: string })?.message || 'Server error')
    );
  }

  // Heartbeat
  private startHeartbeat(): void {
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.isAuthenticated) {
        this.sendPing();
      }
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    this.clearHeartbeatTimeout();
  }

  private sendPing(): void {
    this.send(WSMessageType.PING);

    // Set timeout for pong response
    this.heartbeatTimeout = setTimeout(() => {
      this.logger.warn('Heartbeat timeout - reconnecting');
      this.reconnect();
    }, this.heartbeatTimeoutMs);
  }

  private clearHeartbeatTimeout(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  // Reconnection
  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error('Max reconnect attempts reached');
      this.notifyError(new Error('Unable to connect to server'));
      return;
    }

    const delay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.maxReconnectDelay
    );

    this.logger.info('Scheduling reconnect', {
      attempt: this.reconnectAttempts + 1,
      delay,
    });

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.doConnect();
    }, delay);
  }

  private reconnect(): void {
    this.cleanup();
    if (this.shouldReconnect) {
      this.scheduleReconnect();
    }
  }

  // Message queue
  private queueMessage(message: WSMessage): void {
    // Remove old messages
    const now = Date.now();
    this.messageQueue = this.messageQueue.filter(qm => now - qm.timestamp < this.maxQueueAge);

    // Check queue size
    if (this.messageQueue.length >= this.maxQueueSize) {
      this.messageQueue.shift(); // Remove oldest
    }

    this.messageQueue.push({
      message,
      timestamp: now,
    });

    this.logger.debug('Message queued', { queueSize: this.messageQueue.length });
  }

  private flushMessageQueue(): void {
    const now = Date.now();
    const validMessages = this.messageQueue.filter(qm => now - qm.timestamp < this.maxQueueAge);

    this.logger.info('Flushing message queue', { count: validMessages.length });

    validMessages.forEach(qm => {
      this.sendRaw(qm.message);
    });

    this.messageQueue = [];
  }

  private resubscribe(): void {
    this.subscriptions.forEach(sub => {
      const [resourceType, patientId] = sub.split(':');
      this.send(WSMessageType.SUBSCRIBE, {
        resourceType,
        patientId: patientId || undefined,
      });
    });
  }

  // Utility
  private sendRaw(message: WSMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private generateMessageId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyConnectionChange(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected);
      } catch (error) {
        this.logger.error('Connection handler error', { error });
      }
    });
  }

  private notifyError(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error);
      } catch (err) {
        this.logger.error('Error handler error', { err });
      }
    });
  }

  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }

      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
    this.isAuthenticated = false;
  }

  // App state handling
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener(
      'change',
      this.handleAppStateChange.bind(this)
    );
  }

  private handleAppStateChange(nextState: AppStateStatus): void {
    const prevState = this.appState;
    this.appState = nextState;

    this.logger.debug('App state changed', { from: prevState, to: nextState });

    if (prevState !== 'active' && nextState === 'active') {
      // App came to foreground
      if (this.shouldReconnect && !this.isConnected && this.accessToken) {
        this.doConnect();
      }
    } else if (nextState === 'background') {
      // App went to background - could disconnect to save battery
      // For now, we keep the connection alive
    }
  }

  /**
   * Clean up resources when service is destroyed
   */
  destroy(): void {
    this.disconnect();

    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    this.messageHandlers.clear();
    this.connectionHandlers.clear();
    this.errorHandlers.clear();
    this.subscriptions.clear();
    this.messageQueue = [];
  }
}

// Singleton instance
let wsService: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!wsService) {
    wsService = new WebSocketService();
  }
  return wsService;
};

export const destroyWebSocketService = (): void => {
  if (wsService) {
    wsService.destroy();
    wsService = null;
  }
};

export default WebSocketService;
