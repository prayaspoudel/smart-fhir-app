/**
 * Record Detail Modal Screen
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'RecordDetailModal'>;

const RecordDetailModalScreen: React.FC<Props> = ({ route }) => {
  const { resourceType, resourceId } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{resourceType}</Text>
        <Text style={styles.id}>ID: {resourceId}</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Record details will be displayed here based on the resource type.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
  id: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  placeholder: { backgroundColor: '#F3F4F6', padding: 24, borderRadius: 12 },
  placeholderText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
});

export default RecordDetailModalScreen;
