import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";

type Params = { slug?: string };

export default function MemoryMatchSlug() {
  const params = useLocalSearchParams<Params>();
  const slug = params?.slug;
  const router = useRouter();

  if (!slug) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

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
          onPress={() => router.back()}
          // onPress={() => console.log("Back")}
        >
          <IconSymbol
            size={20}
            color="#fff"
            name="arrow.left"
            style={styles.icon}
          />
        </Pressable>
        <ThemedView
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 40,
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 1,
          }}
        >
          <Pressable
            onPress={() => console.log("Profile")}
            // onPress={() => console.log("Back")}
          >
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.profileImage}
            />
          </Pressable>
          <Pressable
            onPress={() => console.log("Settings")}
            // onPress={() => console.log("Back")}
          >
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.profileImage}
            />
          </Pressable>
        </ThemedView>
        <ThemedView
          style={{
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            height: 800,
            paddingVertical: "40%",
          }}
        >
          {/* List of memory match games */}
          {Array.from({ length: 6 }).map((_, index) => (
            <Pressable
              key={index}
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
              }}
              onPress={() =>
                router.push(
                  `/memory-match/match/${slug}-match-${index + 1}` as any,
                )
              }
            >
              <ThemedText style={styles.memoryMatchText}>
                Memory Match {index + 1}: {slug}
              </ThemedText>
            </Pressable>
          ))}
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
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: "50%",
  },
  memoryMatchText: {
    width: "80%",
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "rgba(219, 21, 160, 1)",
    padding: 16,
    marginVertical: 6,
    borderRadius: 10,
    textAlign: "center",
  },
});
