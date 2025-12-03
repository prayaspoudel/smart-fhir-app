/**
 * Welcome Screen
 *
 * Landing page for unauthenticated users featuring:
 * - App branding
 * - Feature highlights
 * - Get started button
 * - Already have account link
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { AuthStackScreenProps } from '../../navigation/types';

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
}

const FeatureItem: React.FC<FeatureItemProps> = ({ icon, title, description }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIcon}>
      <Icon name={icon} size={24} color="#2563EB" />
    </View>
    <View style={styles.featureText}>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  </View>
);

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<AuthStackScreenProps<'Welcome'>['navigation']>();
  const insets = useSafeAreaInsets();

  const handleGetStarted = () => {
    navigation.navigate('ProviderSelect');
  };

  const handleLogin = () => {
    navigation.navigate('Login', {});
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E40AF', '#2563EB', '#3B82F6']}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Top Section */}
        <View style={[styles.topSection, { paddingTop: insets.top + 48 }]}>
          <View style={styles.logoContainer}>
            <Icon name="heart-pulse" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.appName}>SMART FHIR</Text>
          <Text style={styles.tagline}>Your Health Records, Anywhere</Text>
        </View>

        {/* Bottom Card */}
        <View style={[styles.bottomCard, { paddingBottom: insets.bottom + 24 }]}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeSubtitle}>
            Access your medical records from multiple healthcare providers in one secure app.
          </Text>

          {/* Features */}
          <View style={styles.features}>
            <FeatureItem
              icon="shield-check"
              title="Secure & Private"
              description="End-to-end encryption keeps your data safe"
            />
            <FeatureItem
              icon="hospital-building"
              title="Multi-Provider"
              description="Connect to multiple healthcare providers"
            />
            <FeatureItem
              icon="sync"
              title="Always Updated"
              description="Real-time sync with your health records"
            />
          </View>

          {/* Buttons */}
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Get Started</Text>
            <Icon name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryButtonText}>
              Already have an account? <Text style={styles.linkText}>Sign In</Text>
            </Text>
          </TouchableOpacity>

          {/* Compliance */}
          <View style={styles.compliance}>
            <Icon name="check-decagram" size={16} color="#22C55E" />
            <Text style={styles.complianceText}>HIPAA Compliant • HL7 FHIR R4</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  bottomCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
  },
  features: {
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  linkText: {
    color: '#2563EB',
    fontWeight: '600',
  },
  compliance: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  complianceText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 6,
  },
});

export default WelcomeScreen;
