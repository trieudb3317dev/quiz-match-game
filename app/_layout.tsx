import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import RoomSocketProvider from "@/providers/RoomSocketProvider";

export const unstable_settings = {
  // anchor: "(tabs)",
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <RoomSocketProvider>
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
            name="room/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="room/create"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="room/join"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="room/waiting"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen
            name="not-found"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </RoomSocketProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
