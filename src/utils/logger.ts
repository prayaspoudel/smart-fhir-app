/**
 * Logger Utility
 *
 * Centralized logging with PHI redaction support.
 *
 * SECURITY:
 * - All logs are checked for PHI before output
 * - Sensitive data patterns are automatically redacted
 * - In production, only error logs are output
 * - No PHI should ever appear in logs
 */

import { Config } from './config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

/**
 * PHI patterns to redact from logs
 */
const PHI_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // SSN
  { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN-REDACTED]' },
  // Phone numbers
  { pattern: /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, replacement: '[PHONE-REDACTED]' },
  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL-REDACTED]',
  },
  // MRN-like patterns (6-10 digit numbers)
  { pattern: /\b(?:MRN|mrn|Medical Record)[:\s]*\d{6,10}\b/gi, replacement: '[MRN-REDACTED]' },
  // Date of birth patterns
  {
    pattern: /\b(?:DOB|dob|birth)[:\s]*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/gi,
    replacement: '[DOB-REDACTED]',
  },
  // Names in common patterns (after keywords)
  {
    pattern: /\b(?:patient|name)[:\s]*[A-Z][a-z]+\s+[A-Z][a-z]+\b/gi,
    replacement: '[NAME-REDACTED]',
  },
  // Address patterns
  {
    pattern:
      /\b\d+\s+[A-Za-z]+\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane)\b\.?/gi,
    replacement: '[ADDRESS-REDACTED]',
  },
  // ZIP codes
  { pattern: /\b\d{5}(?:-\d{4})?\b/g, replacement: '[ZIP-REDACTED]' },
];

/**
 * Redact PHI from a string
 */
const redactPHI = (text: string): string => {
  if (!Config.PHI_REDACTION_ENABLED) {
    return text;
  }

  let redacted = text;
  for (const { pattern, replacement } of PHI_PATTERNS) {
    redacted = redacted.replace(pattern, replacement);
  }
  return redacted;
};

/**
 * Redact PHI from an object (recursive)
 */
const redactObjectPHI = (obj: unknown): unknown => {
  if (!Config.PHI_REDACTION_ENABLED) {
    return obj;
  }

  if (typeof obj === 'string') {
    return redactPHI(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactObjectPHI(item));
  }

  if (obj !== null && typeof obj === 'object') {
    const redacted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Redact known sensitive keys entirely
      const sensitiveKeys = [
        'password',
        'token',
        'accessToken',
        'refreshToken',
        'secret',
        'ssn',
        'socialSecurityNumber',
        'dob',
        'dateOfBirth',
        'birthDate',
        'mrn',
        'medicalRecordNumber',
        'patientId',
      ];

      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactObjectPHI(value);
      }
    }
    return redacted;
  }

  return obj;
};

/**
 * Log level priority
 */
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Check if a log level should be output
 */
const shouldLog = (level: LogLevel): boolean => {
  const configLevel = Config.LOG_LEVEL;
  return LOG_LEVELS[level] >= LOG_LEVELS[configLevel];
};

/**
 * Format log entry for output
 */
const formatLogEntry = (entry: LogEntry): string => {
  const { level, message, timestamp, data } = entry;
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data && Object.keys(data).length > 0) {
    return `${prefix} ${message} ${JSON.stringify(data)}`;
  }

  return `${prefix} ${message}`;
};

/**
 * Create a log entry
 */
const createLogEntry = (
  level: LogLevel,
  message: string,
  data?: Record<string, unknown>
): LogEntry => {
  return {
    level,
    message: redactPHI(message),
    timestamp: new Date().toISOString(),
    data: data ? (redactObjectPHI(data) as Record<string, unknown>) : undefined,
  };
};

/**
 * Output log entry
 */
const outputLog = (entry: LogEntry): void => {
  const formatted = formatLogEntry(entry);

  switch (entry.level) {
    case 'debug':
      if (Config.DEBUG_MODE) {
        // eslint-disable-next-line no-console
        console.log(formatted);
      }
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.log(formatted);
      break;
    case 'warn':
      console.warn(formatted);
      break;
    case 'error':
      console.error(formatted);
      break;
  }
};

/**
 * Logger instance
 */
export const Logger = {
  /**
   * Debug level log (only in development)
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      const entry = createLogEntry('debug', message, data);
      outputLog(entry);
    }
  },

  /**
   * Info level log
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      const entry = createLogEntry('info', message, data);
      outputLog(entry);
    }
  },

  /**
   * Warning level log
   */
  warn(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      const entry = createLogEntry('warn', message, data);
      outputLog(entry);
    }
  },

  /**
   * Error level log
   */
  error(message: string, data?: Record<string, unknown>): void {
    if (shouldLog('error')) {
      const entry = createLogEntry('error', message, data);
      outputLog(entry);
    }
  },

  /**
   * Log an exception
   */
  exception(error: Error, context?: string): void {
    const entry = createLogEntry(
      'error',
      context ? `${context}: ${error.message}` : error.message,
      {
        stack: error.stack,
        name: error.name,
      }
    );
    outputLog(entry);
  },
};

// Export as both Logger and logger for convenience
export const logger = Logger;
export default Logger;
