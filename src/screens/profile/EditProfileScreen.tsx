/**
 * Edit Profile Screen
 *
 * Allows users to view and edit their profile information.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector, useAppDispatch } from '../../store';
import { selectIsDarkMode } from '../../store/slices/uiSlice';
import { selectCurrentPatient } from '../../store/slices/authSlice';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  editable?: boolean;
  isDark: boolean;
  multiline?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = true,
  isDark,
  multiline = false,
}) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.fieldLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>{label}</Text>
    <TextInput
      style={[
        styles.fieldInput,
        multiline && styles.multilineInput,
        {
          backgroundColor: isDark ? '#374151' : '#F9FAFB',
          color: isDark ? '#F9FAFB' : '#111827',
          borderColor: isDark ? '#4B5563' : '#E5E7EB',
        },
        !editable && { opacity: 0.6 },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
      keyboardType={keyboardType}
      editable={editable}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const _dispatch = useAppDispatch();

  const isDarkMode = useAppSelector(selectIsDarkMode);
  const patient = useAppSelector(selectCurrentPatient);

  // Form state
  const [firstName, setFirstName] = useState(patient?.name?.[0]?.given?.[0] || '');
  const [lastName, setLastName] = useState(patient?.name?.[0]?.family || '');
  const [email, setEmail] = useState(
    patient?.telecom?.find(t => t.system === 'email')?.value || ''
  );
  const [phone, setPhone] = useState(
    patient?.telecom?.find(t => t.system === 'phone')?.value || ''
  );
  const [address, setAddress] = useState(patient?.address?.[0]?.line?.join(', ') || '');
  const [city, setCity] = useState(patient?.address?.[0]?.city || '');
  const [state, setState] = useState(patient?.address?.[0]?.state || '');
  const [zipCode, setZipCode] = useState(patient?.address?.[0]?.postalCode || '');

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = useCallback(
    (setter: (value: string) => void) => (text: string) => {
      setter(text);
      setHasChanges(true);
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    try {
      // TODO: Implement save to FHIR server
      await new Promise<void>(resolve => setTimeout(() => resolve(), 1000));

      Alert.alert('Success', 'Your profile has been updated.');
      setHasChanges(false);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [hasChanges, navigation]);

  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [hasChanges, navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleSave}
          disabled={!hasChanges || isSaving}
          style={{ marginRight: 8 }}
        >
          <Text
            style={{
              color: hasChanges ? '#3B82F6' : '#9CA3AF',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity onPress={handleCancel} style={{ marginLeft: 8 }}>
          <Text style={{ color: '#3B82F6', fontSize: 16 }}>Cancel</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleSave, handleCancel, hasChanges, isSaving]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            PERSONAL INFORMATION
          </Text>
          <View
            style={[styles.sectionContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
          >
            <FormField
              label="First Name"
              value={firstName}
              onChangeText={handleFieldChange(setFirstName)}
              placeholder="Enter first name"
              isDark={isDarkMode}
            />
            <FormField
              label="Last Name"
              value={lastName}
              onChangeText={handleFieldChange(setLastName)}
              placeholder="Enter last name"
              isDark={isDarkMode}
            />
            <FormField
              label="Date of Birth"
              value={patient?.birthDate || 'Not set'}
              onChangeText={() => {}}
              editable={false}
              isDark={isDarkMode}
            />
            <FormField
              label="Gender"
              value={
                patient?.gender
                  ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)
                  : 'Not set'
              }
              onChangeText={() => {}}
              editable={false}
              isDark={isDarkMode}
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            CONTACT INFORMATION
          </Text>
          <View
            style={[styles.sectionContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
          >
            <FormField
              label="Email"
              value={email}
              onChangeText={handleFieldChange(setEmail)}
              placeholder="Enter email address"
              keyboardType="email-address"
              isDark={isDarkMode}
            />
            <FormField
              label="Phone"
              value={phone}
              onChangeText={handleFieldChange(setPhone)}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              isDark={isDarkMode}
            />
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
            ADDRESS
          </Text>
          <View
            style={[styles.sectionContent, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
          >
            <FormField
              label="Street Address"
              value={address}
              onChangeText={handleFieldChange(setAddress)}
              placeholder="Enter street address"
              multiline
              isDark={isDarkMode}
            />
            <FormField
              label="City"
              value={city}
              onChangeText={handleFieldChange(setCity)}
              placeholder="Enter city"
              isDark={isDarkMode}
            />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <FormField
                  label="State"
                  value={state}
                  onChangeText={handleFieldChange(setState)}
                  placeholder="State"
                  isDark={isDarkMode}
                />
              </View>
              <View style={{ flex: 1 }}>
                <FormField
                  label="ZIP Code"
                  value={zipCode}
                  onChangeText={handleFieldChange(setZipCode)}
                  placeholder="ZIP"
                  isDark={isDarkMode}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Icon name="information-outline" size={20} color={isDarkMode ? '#6B7280' : '#9CA3AF'} />
          <Text style={[styles.noteText, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
            Some information like date of birth and gender is provided by your healthcare provider
            and cannot be edited here. Contact your provider to update this information.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  fieldInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  multilineInput: {
    minHeight: 100,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 12,
    gap: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default EditProfileScreen;
