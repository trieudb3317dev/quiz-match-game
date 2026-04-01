import { Image, Pressable, StyleSheet } from "react-native";

import { getGameTypes } from "@/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuth();

  const [gameTypes, setGameTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchGameTypes = async () => {
      try {
        const types = await getGameTypes();
        setGameTypes(types);
      } catch (error) {
        console.error("Error fetching game types:", error);
      }
    };

    fetchGameTypes();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.container}>
        {loading && (
          <ThemedText style={{ marginBottom: 20 }}>Loading...</ThemedText>
        )}
        <Image
          source={
            isAuthenticated && user?.avatar_url
              ? { uri: user.avatar_url }
              : require("@/assets/images/react-logo.png")
          }
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
          {gameTypes.map((game: any) => (
            <Pressable
              key={game.id}
              style={styles.button}
              onPress={() =>
                router.replace(`/${game.key.split("_").join("-")}` as any)
              }
            >
              <ThemedText style={styles.buttonText}>{game.name}</ThemedText>
            </Pressable>
          ))}
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
