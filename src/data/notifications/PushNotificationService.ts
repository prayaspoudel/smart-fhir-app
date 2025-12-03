/**
 * Push Notification Service (Stub)
 *
 * This is a stub implementation. To enable push notifications:
 * 1. npm install @react-native-firebase/app @react-native-firebase/messaging @notifee/react-native
 * 2. Configure Firebase for your project
 * 3. Implement the full notification handling
 */

import { Platform } from 'react-native';
import { Logger } from '../../utils/logger';

// Notification types
export enum NotificationType {
  // Health records
  NEW_LAB_RESULT = 'new_lab_result',
  ABNORMAL_RESULT = 'abnormal_result',
  NEW_DIAGNOSTIC_REPORT = 'new_diagnostic_report',
  MEDICATION_REFILL = 'medication_refill',
  MEDICATION_REMINDER = 'medication_reminder',

  // Appointments
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',

  // Provider
  PROVIDER_MESSAGE = 'provider_message',
  CARE_PLAN_UPDATE = 'care_plan_update',

  // System
  CONSENT_REQUEST = 'consent_request',
  SYNC_COMPLETE = 'sync_complete',
  SESSION_EXPIRING = 'session_expiring',

  // General
  GENERAL = 'general',
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    resourceType?: string;
    resourceId?: string;
    providerId?: string;
    patientId?: string;
    deepLink?: string;
    [key: string]: unknown;
  };
  imageUrl?: string;
  badge?: number;
}

type NotificationHandler = (payload: NotificationPayload) => void;
type DeepLinkHandler = (deepLink: string) => void;

class PushNotificationService {
  private isInitialized = false;
  private fcmToken: string | null = null;

  // Handlers
  private notificationHandlers: Map<NotificationType, Set<NotificationHandler>> = new Map();
  private deepLinkHandler: DeepLinkHandler | null = null;

  constructor() {
    Logger.debug('PushNotificationService: Stub implementation initialized');
  }

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    Logger.info('PushNotificationService: Stub - Push notifications not configured');
    Logger.info(
      'To enable push notifications, install @react-native-firebase/messaging and @notifee/react-native'
    );

    this.isInitialized = true;
    return true;
  }

  // ============================================================================
  // Public API
  // ============================================================================

  /**
   * Get the FCM token
   */
  getFCMToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Register FCM token with backend
   */
  async registerTokenWithBackend(_apiUrl: string, _accessToken: string): Promise<boolean> {
    Logger.debug('PushNotificationService: Stub - registerTokenWithBackend called');
    return false;
  }

  /**
   * Unregister from notifications
   */
  async unregisterFromBackend(_apiUrl: string, _accessToken: string): Promise<void> {
    Logger.debug('PushNotificationService: Stub - unregisterFromBackend called');
  }

  /**
   * Display a local notification
   */
  async displayLocalNotification(payload: NotificationPayload): Promise<string> {
    Logger.debug('PushNotificationService: Stub - displayLocalNotification', {
      title: payload.title,
      type: payload.type,
    });
    return `stub_${Date.now()}`;
  }

  /**
   * Cancel a notification
   */
  async cancelNotification(_notificationId: string): Promise<void> {
    Logger.debug('PushNotificationService: Stub - cancelNotification called');
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    Logger.debug('PushNotificationService: Stub - cancelAllNotifications called');
  }

  /**
   * Update app badge count
   */
  async setBadgeCount(_count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      Logger.debug('PushNotificationService: Stub - setBadgeCount called');
    }
  }

  /**
   * Get current badge count
   */
  async getBadgeCount(): Promise<number> {
    return 0;
  }

  /**
   * Register a handler for a notification type
   */
  onNotification(type: NotificationType, handler: NotificationHandler): () => void {
    if (!this.notificationHandlers.has(type)) {
      this.notificationHandlers.set(type, new Set());
    }
    this.notificationHandlers.get(type)!.add(handler);

    return () => {
      this.notificationHandlers.get(type)?.delete(handler);
    };
  }

  /**
   * Register a deep link handler
   */
  onDeepLink(handler: DeepLinkHandler): () => void {
    this.deepLinkHandler = handler;
    return () => {
      this.deepLinkHandler = null;
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.notificationHandlers.clear();
    this.deepLinkHandler = null;
    this.isInitialized = false;
  }
}

// Singleton instance
let notificationService: PushNotificationService | null = null;

export const getPushNotificationService = (): PushNotificationService => {
  if (!notificationService) {
    notificationService = new PushNotificationService();
  }
  return notificationService;
};

export const destroyPushNotificationService = (): void => {
  if (notificationService) {
    notificationService.destroy();
    notificationService = null;
  }
};

export default PushNotificationService;
