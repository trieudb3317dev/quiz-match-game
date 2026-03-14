import { Stack } from "expo-router";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false, title: "Sign In" }}
      />
      <Stack.Screen
        name="sign-up"
        options={{ headerShown: false, title: "Sign Up" }}
      />
    </Stack>
  );
}
