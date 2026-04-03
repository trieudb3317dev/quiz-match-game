import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

export default function CreateRoom() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("4");
  const [isPrivate, setIsPrivate] = useState(false);

  const handleCreate = () => {
    // simulate create and generate a 6-digit code
    const code = Math.floor(Math.random() * 900000 + 100000).toString();
    // navigate to waiting room with code
    router.push(`/room/waiting?code=${code}` as any);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#5B1D7A", dark: "#2B0F3B" }}
    >
      <ThemedView style={styles.container}>
        <Pressable style={styles.arrowBack} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={20} color="#fff" />
        </Pressable>
        <ThemedText style={styles.title}>Create new room</ThemedText>

        <View style={styles.form}>
          <TextInput
            placeholder="Name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <TextInput
            placeholder="Descriptions"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={desc}
            onChangeText={setDesc}
            style={[styles.input, { height: 120 }]}
            multiline
          />
          <TextInput
            placeholder="Max Players (e.g. 4)"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={maxPlayers}
            onChangeText={setMaxPlayers}
            style={styles.input}
          />
          <TextInput
            placeholder="Private (true/false)"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={isPrivate ? "true" : "false"}
            onChangeText={(text) => setIsPrivate(text.toLowerCase() === "true")}
            style={styles.input}
          />

          <Pressable onPress={handleCreate} style={styles.createButton}>
            <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
              Create
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
  createButton: {
    marginTop: 12,
    backgroundColor: "#1773FF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
