import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function JoinRoom() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleJoin = () => {
    if (!code) return;
    router.push(`/room/waiting?code=${encodeURIComponent(code)}` as any);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#5B1D7A", dark: "#2B0F3B" }}
    >
      <ThemedView style={styles.container}>
        <Pressable style={styles.arrowBack} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={20} color="#fff" />
        </Pressable>
        <ThemedText style={styles.title}>Join</ThemedText>

        <View style={styles.form}>
          <TextInput
            placeholder="Enter code"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={code}
            onChangeText={setCode}
            style={styles.input}
          />

          <Pressable onPress={handleJoin} style={styles.joinButton}>
            <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
              Join
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    paddingVertical: 40,
    position: "relative",
  },
  arrowBack: {
    position: "absolute",
    top: 20,
    left: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
  },
  form: {
    width: "90%",
  },
  input: {
    width: "100%",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    color: "#fff",
    marginVertical: 8,
  },
  joinButton: {
    marginTop: 12,
    backgroundColor: "#1773FF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
