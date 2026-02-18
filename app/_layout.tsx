import { Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import { Cinzel_400Regular, Cinzel_700Bold, useFonts } from "@expo-google-fonts/cinzel";
import { Lato_300Light, Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Newsreader_400Regular, Newsreader_400Regular_Italic, Newsreader_700Bold } from "@expo-google-fonts/newsreader";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { I18nManager, View } from "react-native";
import "../global.css";

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Cinzel_400Regular,
    Cinzel_700Bold,
    Lato_300Light,
    Lato_400Regular,
    Lato_700Bold,
    Amiri_400Regular,
    Amiri_700Bold,
    Newsreader_400Regular,
    Newsreader_400Regular_Italic,
    Newsreader_700Bold,
  });

  useEffect(() => {
    // Configure RTL for Arabic content
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(false); // We handle RTL per component or reading view to avoid UI mess

    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0c14' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#0a0c14",
          },
          headerTintColor: "#bf9540",
          headerTitleStyle: {
            fontFamily: "Cinzel_700Bold",
          },
          contentStyle: {
            backgroundColor: "#0a0c14",
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
