/**
 * Record Search Screen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RecordsStackParamList, 'RecordSearch'>;

const RecordSearchScreen: React.FC<Props> = ({ route }) => {
  const [query, setQuery] = useState(route.params?.initialQuery || '');
  const [results] = useState<string[]>([]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search records..."
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
      </View>
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <View style={styles.resultItem}>
            <Text>{item}</Text>
          </View>
        )}
        keyExtractor={(_item, index) => index.toString()}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {query ? 'No results found' : 'Enter a search term'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  searchContainer: { padding: 16 },
  searchInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultItem: { padding: 16, backgroundColor: '#FFF', marginBottom: 1 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 64 },
  emptyText: { fontSize: 16, color: '#6B7280' },
});

export default RecordSearchScreen;
