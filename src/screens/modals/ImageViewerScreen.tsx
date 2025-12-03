/**
 * Image Viewer Screen
 */

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ImageViewer'>;

const ImageViewerScreen: React.FC<Props> = ({ route }) => {
  const { urls, title, initialIndex = 0 } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView
        horizontal
        pagingEnabled
        contentOffset={{ x: initialIndex * 300, y: 0 }}
        style={styles.scrollView}
      >
        {urls.map((url, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{ uri: url }} style={styles.image} resizeMode="contain" />
          </View>
        ))}
      </ScrollView>
      <Text style={styles.counter}>
        {initialIndex + 1} / {urls.length}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  title: { fontSize: 16, color: '#FFF', textAlign: 'center', padding: 16 },
  scrollView: { flex: 1 },
  imageContainer: { width: 300, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%' },
  counter: { fontSize: 14, color: '#FFF', textAlign: 'center', padding: 16 },
});

export default ImageViewerScreen;
