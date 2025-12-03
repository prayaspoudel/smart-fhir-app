# SMART on FHIR Mobile App

A production-ready React Native mobile application implementing a SMART on FHIR client for accessing medical records on mobile devices. Built with TypeScript and following Clean Architecture principles.

## 🏥 Features

### Authentication & Security
- **OAuth2 SMART on FHIR** - Standards-based authentication with healthcare providers
- **PKCE Flow** - Proof Key for Code Exchange for enhanced security
- **Two-Factor Authentication** - TOTP-based 2FA support
- **Biometric Authentication** - Face ID, Touch ID, and Android biometrics
- **Session Management** - Automatic token refresh, session timeout warnings
- **E2E Encryption** - AES-256-GCM encryption for PHI data

### FHIR R4 Compliance
- Full HL7 FHIR R4 resource support:
  - Patient demographics
  - Observations (vitals, lab results)
  - Diagnostic Reports
  - Encounters
  - Medication Requests
  - Consents
- Resource validation using Zod schemas
- Multi-provider data aggregation

### Real-Time Features
- **WebSocket Integration** - Live EMR updates, new lab results
- **Push Notifications** - APNS (iOS) and FCM (Android)
- **Background Sync** - Automatic data synchronization
- **Offline Support** - View cached data when offline

### User Experience
- Native iOS and Android support
- Dark/Light theme support
- Accessibility compliant (WCAG 2.1 AA)
- Responsive layout design
- Pull-to-refresh data sync

## 🏗️ Architecture

```
src/
├── domain/           # Business logic layer
│   ├── entities/     # FHIR domain models
│   └── usecases/     # Business operations
├── data/             # Data access layer
│   ├── auth/         # Authentication service
│   ├── fhir/         # FHIR client
│   ├── websocket/    # Real-time communication
│   └── notifications/# Push notifications
├── infrastructure/   # External services
│   ├── api/          # HTTP client
│   ├── encryption/   # E2E encryption
│   ├── storage/      # Secure storage
│   └── validators/   # FHIR validation
├── navigation/       # React Navigation setup
├── query/            # React Query hooks
├── screens/          # UI screens
├── store/            # Redux state management
└── utils/            # Utilities
```

## 📋 Prerequisites

- Node.js 18+ LTS
- npm 9+ or yarn 1.22+
- React Native CLI
- Xcode 15+ (iOS development)
- Android Studio (Android development)
- CocoaPods (iOS dependencies)

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Navigate to project directory
cd smart-fhir-app

# Install dependencies
npm install

# iOS only: Install pods
cd ios && pod install && cd ..
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

Required environment variables:
- `FHIR_BASE_URL` - Your FHIR server base URL
- `AUTH_CLIENT_ID` - OAuth2 client ID
- `AUTH_REDIRECT_URL` - OAuth2 redirect URI
- `ENCRYPTION_KEY` - 32-byte encryption key (base64)

### 3. Run Development Server

```bash
# Start Metro bundler
npm start

# iOS (in separate terminal)
npm run ios

# Android (in separate terminal)
npm run android
```

## 🔧 Configuration

### OAuth2 SMART on FHIR

The app supports SMART on FHIR launch modes:

**Standalone Launch:**
```typescript
const authService = new AuthService();
await authService.startSMARTAuth({
  iss: 'https://fhir.provider.com/r4',
  // Patient selects their EHR
});
```

**EHR Launch:**
```typescript
// Deep link: smartfhir://launch?iss=...&launch=...
await authService.handleEHRLaunch(iss, launchToken);
```

### Provider Registration

Add healthcare providers in `src/data/fhir/ProviderRegistry.ts`:

```typescript
const provider: Provider = {
  id: 'provider-uuid',
  name: 'Healthcare System',
  fhirBaseUrl: 'https://fhir.example.com/r4',
  smartConfiguration: {
    authorizationEndpoint: 'https://auth.example.com/authorize',
    tokenEndpoint: 'https://auth.example.com/token',
  },
};
```

## 📱 Screens

| Screen | Description |
|--------|-------------|
| Welcome | Landing page with app features |
| Provider Select | Choose healthcare provider |
| Login | Email/password or SMART auth |
| 2FA Verification | TOTP code entry |
| Dashboard | Patient summary overview |
| Vitals | Heart rate, BP, weight, etc. |
| Lab Results | Laboratory observations |
| Medications | Active/past medications |
| Encounters | Visit history |
| Providers | Connected EHR systems |
| Profile | User settings |

## 🔐 Security

### Data Protection
- All PHI encrypted at rest using AES-256-GCM
- Secure storage via iOS Keychain / Android Keystore
- Certificate pinning for API calls
- Automatic session timeout

### Compliance
- HIPAA-compliant data handling
- HL7 FHIR R4 standard compliance
- PHI redaction in logs
- Audit trail support

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests (Detox)
npm run e2e:ios
npm run e2e:android
```

## 📦 Building for Production

### iOS

```bash
# Build release
cd ios && xcodebuild -workspace SmartFHIR.xcworkspace \
  -scheme SmartFHIR \
  -configuration Release \
  -archivePath build/SmartFHIR.xcarchive \
  archive
```

### Android

```bash
# Build release APK
cd android && ./gradlew assembleRelease

# Build release AAB (for Play Store)
cd android && ./gradlew bundleRelease
```

## 📖 API Documentation

### FHIR Client

```typescript
import { FHIRClient } from './data/fhir/FHIRClient';

const client = new FHIRClient(provider, accessToken);

// Fetch patient
const patient = await client.getPatient(patientId);

// Fetch observations
const vitals = await client.getObservations(patientId, {
  category: 'vital-signs',
  dateFrom: '2024-01-01',
});

// Fetch medications
const meds = await client.getMedicationRequests(patientId, {
  status: 'active',
});
```

### State Management

```typescript
import { useAppSelector, useAppDispatch } from './store';
import { selectCurrentPatient } from './store/slices/authSlice';

// In component
const patient = useAppSelector(selectCurrentPatient);
const dispatch = useAppDispatch();
```

### React Query Hooks

```typescript
import { useObservations, useVitals } from './query/useFHIRData';

const { data, isLoading, refetch } = useVitals(patientId, providerUrl);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [HL7 FHIR](https://www.hl7.org/fhir/) - Healthcare interoperability standard
- [SMART on FHIR](https://smarthealthit.org/) - App authorization framework
- [React Native](https://reactnative.dev/) - Cross-platform mobile framework
- [React Navigation](https://reactnavigation.org/) - Navigation library
- [Redux Toolkit](https://redux-toolkit.js.org/) - State management
- [TanStack Query](https://tanstack.com/query) - Data fetching

## 📞 Support

For support, email support@smartfhir.app or open an issue on GitHub.
