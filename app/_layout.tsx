import "../global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { View, I18nManager } from "react-native";

// Force RTL for Arabic
I18nManager.forceRTL(true);
I18nManager.allowRTL(true);

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // We can add custom fonts here later
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }

    // Ensure RTL is active according to Manager
    console.log("Current I18nManager.isRTL:", I18nManager.isRTL);
    if (!I18nManager.isRTL) {
      console.log("Forcing RTL...");
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
      // In some environments, a reload might be desired here but expo-updates might not be installed.
      // We'll trust the forced state for now.
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#121212' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1A1A1A",
          },
          headerTintColor: "#D4AF37",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#121212",
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="surah/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="reader/[storyId]" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
