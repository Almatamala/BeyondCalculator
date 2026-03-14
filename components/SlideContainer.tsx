import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  question: string;
  children: React.ReactNode;
}

export default function SlideContainer({ question, children }: Props) {
  // TODO: style as a full-screen slide with branded typography
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  content: {
    gap: 16,
  },
});
