/**
 * PDF Viewer Screen
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PDFViewer'>;

const PDFViewerScreen: React.FC<Props> = ({ route }) => {
  const { title, url } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>PDF Viewer</Text>
          <Text style={styles.url}>{url}</Text>
          <Text style={styles.note}>Install react-native-pdf to view PDF documents</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  placeholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  placeholderText: { fontSize: 24, fontWeight: '600', color: '#6B7280', marginBottom: 16 },
  url: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 },
  note: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});

export default PDFViewerScreen;
