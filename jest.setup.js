/**
 * Jest Setup File
 */

// Mock react-native modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    AppState: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
      currentState: 'active',
    },
    Linking: {
      openURL: jest.fn(),
      canOpenURL: jest.fn(() => Promise.resolve(true)),
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
      getInitialURL: jest.fn(() => Promise.resolve(null)),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(obj => obj.ios || obj.default),
    },
  };
});

// Mock react-native-keychain
jest.mock('react-native-keychain', () => ({
  SECURITY_LEVEL: { ANY: 'ANY', SECURE_SOFTWARE: 'SECURE_SOFTWARE', SECURE_HARDWARE: 'SECURE_HARDWARE' },
  ACCESSIBLE: { WHEN_UNLOCKED: 'WHEN_UNLOCKED', AFTER_FIRST_UNLOCK: 'AFTER_FIRST_UNLOCK' },
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve({ username: 'test', password: 'test' })),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  getSupportedBiometryType: jest.fn(() => Promise.resolve('FaceID')),
}));

// Mock @react-native-firebase/messaging
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(() => ({})),
  getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  requestPermission: jest.fn(() => Promise.resolve(1)),
  AuthorizationStatus: { AUTHORIZED: 1, PROVISIONAL: 2, NOT_DETERMINED: -1, DENIED: 0 },
}));

// Mock @notifee/react-native
jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    displayNotification: jest.fn(() => Promise.resolve('notification-id')),
    cancelNotification: jest.fn(() => Promise.resolve()),
    cancelAllNotifications: jest.fn(() => Promise.resolve()),
    createChannel: jest.fn(() => Promise.resolve()),
    requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
    setBadgeCount: jest.fn(() => Promise.resolve()),
    getBadgeCount: jest.fn(() => Promise.resolve(0)),
    onForegroundEvent: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
  },
  AndroidImportance: { HIGH: 4, DEFAULT: 3, LOW: 2, MIN: 1, NONE: 0 },
  AndroidVisibility: { PRIVATE: 0, PUBLIC: 1, SECRET: -1 },
  AuthorizationStatus: { AUTHORIZED: 1, DENIED: 0, NOT_DETERMINED: -1, PROVISIONAL: 2 },
  EventType: { DISMISSED: 0, PRESS: 1 },
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

// Mock react-native-linear-gradient
jest.mock('react-native-linear-gradient', () => 'LinearGradient');

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureHandlerRootView: View,
    PanGestureHandler: View,
    TapGestureHandler: View,
    ScrollView: require('react-native').ScrollView,
  };
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock @react-navigation
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Mock tweetnacl
jest.mock('tweetnacl', () => ({
  box: {
    keyPair: jest.fn(() => ({
      publicKey: new Uint8Array(32),
      secretKey: new Uint8Array(32),
    })),
    before: jest.fn(() => new Uint8Array(32)),
    open: jest.fn(() => new Uint8Array(16)),
    after: jest.fn(() => new Uint8Array(16)),
  },
  secretbox: {
    open: jest.fn(() => new Uint8Array(16)),
  },
  randomBytes: jest.fn((n) => new Uint8Array(n)),
}));

jest.mock('tweetnacl-util', () => ({
  encodeUTF8: jest.fn((s) => new Uint8Array(Buffer.from(s))),
  decodeUTF8: jest.fn((arr) => Buffer.from(arr).toString()),
  encodeBase64: jest.fn((arr) => Buffer.from(arr).toString('base64')),
  decodeBase64: jest.fn((s) => new Uint8Array(Buffer.from(s, 'base64'))),
}));

// Silence console during tests (optional)
if (process.env.SILENT_TESTS) {
  global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  };
}

// Global test timeout
jest.setTimeout(30000);
