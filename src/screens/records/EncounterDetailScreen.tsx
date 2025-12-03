/**
 * Encounter Detail Screen
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RecordsStackParamList, 'EncounterDetail'>;

const EncounterDetailScreen: React.FC<Props> = ({ route }) => {
  const { encounterId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Encounter Details</Text>
          <Text style={styles.id}>ID: {encounterId}</Text>
          <Text style={styles.placeholder}>
            Detailed encounter information will be displayed here.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { padding: 16 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  id: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  placeholder: { fontSize: 16, color: '#6B7280', lineHeight: 24 },
});

export default EncounterDetailScreen;
