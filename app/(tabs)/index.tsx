import { Image, Pressable, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.container}>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={styles.profileImage}
        />
        <Image
          source={require("@/assets/images/Logo.png")}
          style={styles.logo}
        />
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={styles.title}>
            PHOTO QUIZ & MATCH GAME
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <Pressable
            style={styles.button}
            onPress={() => router.replace("/photo-quiz")}
          >
            <ThemedText style={styles.buttonText}>Photo Quiz</ThemedText>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={() => router.replace("/memory-match")}
          >
            <ThemedText style={styles.buttonText}>Memory Match</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 20,
    position: "relative",
  },
  titleContainer: {
    gap: 8,
    width: "90%",
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    width: "100%",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginTop: 20,
    position: "absolute",
    top: 0,
    right: 0,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    width: "100%",
  },
  logo: {
    width: 140,
    height: 140,
    alignSelf: "center",
    marginTop: 50,
    marginBottom: 30,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
});
