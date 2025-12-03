/**
 * Emergency Contacts Screen
 *
 * Manage emergency contact information for the patient.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppSelector } from '../../store';
import { selectIsDarkMode } from '../../store/slices/uiSlice';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  isPrimary: boolean;
}

interface ContactCardProps {
  contact: EmergencyContact;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (id: string) => void;
  onSetPrimary: (id: string) => void;
  isDark: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  onEdit,
  onDelete,
  onSetPrimary,
  isDark,
}) => (
  <View
    style={[
      styles.contactCard,
      { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' },
      contact.isPrimary && styles.primaryCard,
    ]}
  >
    <View style={styles.contactHeader}>
      <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}>
        <Icon
          name="account"
          size={24}
          color={contact.isPrimary ? '#22C55E' : isDark ? '#9CA3AF' : '#6B7280'}
        />
      </View>
      <View style={styles.contactInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.contactName, { color: isDark ? '#F9FAFB' : '#111827' }]}>
            {contact.name}
          </Text>
          {contact.isPrimary && (
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary</Text>
            </View>
          )}
        </View>
        <Text style={[styles.contactRelationship, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
          {contact.relationship}
        </Text>
      </View>
    </View>

    <View style={styles.contactDetails}>
      <View style={styles.detailRow}>
        <Icon name="phone" size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
        <Text style={[styles.detailText, { color: isDark ? '#D1D5DB' : '#4B5563' }]}>
          {contact.phone}
        </Text>
      </View>
      {contact.email && (
        <View style={styles.detailRow}>
          <Icon name="email" size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
          <Text style={[styles.detailText, { color: isDark ? '#D1D5DB' : '#4B5563' }]}>
            {contact.email}
          </Text>
        </View>
      )}
    </View>

    <View style={styles.actionRow}>
      {!contact.isPrimary && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
          onPress={() => onSetPrimary(contact.id)}
        >
          <Icon name="star-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text style={[styles.actionText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}>
            Set Primary
          </Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: isDark ? '#374151' : '#F3F4F6' }]}
        onPress={() => onEdit(contact)}
      >
        <Icon name="pencil" size={16} color={isDark ? '#60A5FA' : '#3B82F6'} />
        <Text style={[styles.actionText, { color: isDark ? '#60A5FA' : '#3B82F6' }]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: isDark ? '#7F1D1D' : '#FEE2E2' }]}
        onPress={() => onDelete(contact.id)}
      >
        <Icon name="delete" size={16} color={isDark ? '#FCA5A5' : '#EF4444'} />
        <Text style={[styles.actionText, { color: isDark ? '#FCA5A5' : '#EF4444' }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const EmergencyContactsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useAppSelector(selectIsDarkMode);

  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: '1',
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4567',
      email: 'jane.doe@email.com',
      isPrimary: true,
    },
    {
      id: '2',
      name: 'Michael Smith',
      relationship: 'Brother',
      phone: '+1 (555) 234-5678',
      isPrimary: false,
    },
    {
      id: '3',
      name: 'Sarah Johnson',
      relationship: 'Parent',
      phone: '+1 (555) 345-6789',
      email: 'sarah.johnson@email.com',
      isPrimary: false,
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formName, setFormName] = useState('');
  const [formRelationship, setFormRelationship] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const resetForm = useCallback(() => {
    setFormName('');
    setFormRelationship('');
    setFormPhone('');
    setFormEmail('');
    setEditingContact(null);
  }, []);

  const handleAddContact = useCallback(() => {
    resetForm();
    setIsModalVisible(true);
  }, [resetForm]);

  const handleEditContact = useCallback((contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormRelationship(contact.relationship);
    setFormPhone(contact.phone);
    setFormEmail(contact.email || '');
    setIsModalVisible(true);
  }, []);

  const handleDeleteContact = useCallback(
    (id: string) => {
      const contact = contacts.find(c => c.id === id);
      Alert.alert('Delete Contact', `Are you sure you want to delete ${contact?.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setContacts(prev => prev.filter(c => c.id !== id));
          },
        },
      ]);
    },
    [contacts]
  );

  const handleSetPrimary = useCallback((id: string) => {
    setContacts(prev =>
      prev.map(c => ({
        ...c,
        isPrimary: c.id === id,
      }))
    );
  }, []);

  const handleSaveContact = useCallback(() => {
    if (!formName.trim() || !formRelationship.trim() || !formPhone.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    if (editingContact) {
      // Update existing contact
      setContacts(prev =>
        prev.map(c =>
          c.id === editingContact.id
            ? {
                ...c,
                name: formName,
                relationship: formRelationship,
                phone: formPhone,
                email: formEmail || undefined,
              }
            : c
        )
      );
    } else {
      // Add new contact
      const newContact: EmergencyContact = {
        id: Date.now().toString(),
        name: formName,
        relationship: formRelationship,
        phone: formPhone,
        email: formEmail || undefined,
        isPrimary: contacts.length === 0,
      };
      setContacts(prev => [...prev, newContact]);
    }

    setIsModalVisible(false);
    resetForm();
  }, [
    formName,
    formRelationship,
    formPhone,
    formEmail,
    editingContact,
    contacts.length,
    resetForm,
  ]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
          paddingTop: 16,
        }}
      >
        {contacts.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon
              name="account-multiple-plus"
              size={64}
              color={isDarkMode ? '#4B5563' : '#9CA3AF'}
            />
            <Text style={[styles.emptyTitle, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
              No Emergency Contacts
            </Text>
            <Text style={[styles.emptyText, { color: isDarkMode ? '#6B7280' : '#9CA3AF' }]}>
              Add emergency contacts to ensure your loved ones can be reached in case of a medical
              emergency.
            </Text>
          </View>
        ) : (
          contacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
              onSetPrimary={handleSetPrimary}
              isDark={isDarkMode}
            />
          ))
        )}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 16 }]}
        onPress={handleAddContact}
      >
        <Icon name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View
          style={[styles.modalContainer, { backgroundColor: isDarkMode ? '#111827' : '#F3F4F6' }]}
        >
          <View
            style={[styles.modalHeader, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
          >
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Text style={[styles.cancelButton, { color: '#3B82F6' }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: isDarkMode ? '#F9FAFB' : '#111827' }]}>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <TouchableOpacity onPress={handleSaveContact}>
              <Text style={[styles.saveButton, { color: '#3B82F6' }]}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View
              style={[styles.formSection, { backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF' }]}
            >
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  Name *
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                      color: isDarkMode ? '#F9FAFB' : '#111827',
                      borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    },
                  ]}
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Full name"
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  Relationship *
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                      color: isDarkMode ? '#F9FAFB' : '#111827',
                      borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    },
                  ]}
                  value={formRelationship}
                  onChangeText={setFormRelationship}
                  placeholder="e.g., Spouse, Parent, Sibling"
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  Phone Number *
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                      color: isDarkMode ? '#F9FAFB' : '#111827',
                      borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    },
                  ]}
                  value={formPhone}
                  onChangeText={setFormPhone}
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: isDarkMode ? '#9CA3AF' : '#6B7280' }]}>
                  Email (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.formInput,
                    {
                      backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                      color: isDarkMode ? '#F9FAFB' : '#111827',
                      borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
                    },
                  ]}
                  value={formEmail}
                  onChangeText={setFormEmail}
                  placeholder="email@example.com"
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contactCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  primaryCard: {
    borderWidth: 2,
    borderColor: '#22C55E',
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '600',
  },
  primaryBadge: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  contactRelationship: {
    fontSize: 14,
    marginTop: 2,
  },
  contactDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingTop: 16,
  },
  formSection: {
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  formField: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  formInput: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});

export default EmergencyContactsScreen;
