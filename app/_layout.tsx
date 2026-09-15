import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { I18nProvider } from '../src/features/i18n';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Galmuri11: require('../assets/fonts/Galmuri11.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: '#f6f7f2' },
              headerShown: false,
            }}
          />
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </I18nProvider>
    </GestureHandlerRootView>
  );
}
