import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  // anchor: "(tabs)",
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{ presentation: "modal", title: "Modal" }}
        />
        <Stack.Screen
          name="photo-quiz"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="memory-match"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="photo-quiz/[slug]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="photo-quiz/quiz/[slug]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="memory-match/[slug]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="memory-match/match/[slug]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="photo-quiz/scoreboard"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="not-found"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
