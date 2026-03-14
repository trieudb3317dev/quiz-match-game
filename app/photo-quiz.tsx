import { Pressable, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { useRouter } from "expo-router";

export default function PhotoQuizScreen() {
  const router = useRouter();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.container}>
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            padding: 12,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderRadius: "50%",
            zIndex: 1,
          }}
          //   onPress={() => router.back()}
          onPress={() => router.replace("/(tabs)")}
        >
          <IconSymbol
            size={20}
            color="#fff"
            name="arrow.left"
            style={styles.icon}
          />
        </Pressable>
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: 12,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderRadius: "50%",
            zIndex: 1,
          }}
          //   onPress={() => router.back()}
          onPress={() => console.log("Profile")}
        >
          <Image
            source={require("@/assets/images/react-logo.png")}
            style={styles.profileImage}
          />
        </Pressable>
        <Pressable
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            padding: 12,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderRadius: "50%",
            zIndex: 1,
          }}
          //   onPress={() => router.back()}
          onPress={() => console.log("Profile")}
        >
          <IconSymbol
            size={20}
            color="#fff"
            name="arrow.right"
            style={styles.icon}
          />
        </Pressable>

        <ThemedView style={styles.optionsContainer}>
          <ThemedText type="title" style={styles.title}>
            Photo Quiz
          </ThemedText>
          <Pressable
            style={styles.optionButton}
            onPress={() => router.push(`/photo-quiz/${"easy"}` as any)}
          >
            <ThemedText style={styles.optionButtonText}>Easy</ThemedText>
          </Pressable>
          <Pressable
            style={styles.optionButton}
            onPress={() => router.push(`/photo-quiz/${"medium"}` as any)}
          >
            <ThemedText style={styles.optionButtonText}>Medium</ThemedText>
          </Pressable>
          <Pressable
            style={styles.optionButton}
            onPress={() => router.push(`/photo-quiz/${"hard"}` as any)}
          >
            <ThemedText style={styles.optionButtonText}>Hard</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  icon: {
    fontWeight: "bold",
  },
  profileImage: {
    width: 20,
    height: 20,
    borderRadius: 20,
  },
  optionsContainer: {
    marginTop: 20,
    width: "90%",
    height: 600,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    backgroundColor: "transparent",
  },
  title: {
    width: "100%",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#000f96ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlign: "center",
  },
  optionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    width: "100%",
  },
  optionButtonText: {
    textAlign: "center",
  },
});
