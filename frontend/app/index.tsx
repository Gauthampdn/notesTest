import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import ChatScreen from '../components/ChatScreen';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <ChatScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
