import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>Expo app harness</Text>
      <Text style={styles.title}>Habit Town</Text>
      <Text style={styles.subtitle}>
        React Native, Expo Router, native navigation primitives, and web support
        are wired together.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#f6f7f2',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  eyebrow: {
    color: '#6b7a73',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  subtitle: {
    color: '#52615a',
    fontSize: 18,
    lineHeight: 26,
    marginTop: 14,
    maxWidth: 480,
    textAlign: 'center',
  },
  title: {
    color: '#21342d',
    fontSize: 40,
    fontWeight: '700',
    textAlign: 'center',
  },
});
