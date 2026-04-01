import { getQuizzes } from "@/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import useSoloWebsocket from "@/hooks/use-solo-websocket";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

type Params = { slug?: string };

export default function PhotoQuizSlug() {
  const params = useLocalSearchParams<Params>();
  const slug = params?.slug;
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  const expoExtra =
    (Constants as any).manifest?.extra ||
    (Constants as any).expoConfig?.extra ||
    {};

  const {
    connected,
    connect,
    disconnect,
    addListener,
    joinSession,
    backJoinSession,
  } = useSoloWebsocket({
    path: `${expoExtra?.NEXT_PUBLIC_WS_BASE_URL}${expoExtra?.NEXT_PUBLIC_WS_PREFIX}/solo-session/game_type/${slug}/resource_type/${slug}/resource_id/${slug}`,
    autoConnect: false,
  });

  if (!slug) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  // scrolls
  const handleScroll = () => {
    setPage((prevPage) => prevPage + 1);
  };

  // Make scroll listener to fetch more quizzes when scrolls to bottom
  const scrollListener = () => {
    handleScroll();
  };

  window.addEventListener("scroll", scrollListener);

  useEffect(() => {
    // Fetch quizzes when scrolls screen or when slug changes
    const fetchQuizzes = async (page: number, pageSize: number) => {
      try {
        const res = await getQuizzes({
          page,
          pageSize,
          query: "",
          difficulty: slug,
          sortBy: "created_at",
          order: "desc",
        });
        setQuizzes(res.quizzes);
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes(page, pageSize);
  }, [slug]);

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
            {isAuthenticated && user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require("@/assets/images/react-logo.png")}
                style={styles.profileImage}
              />
            )}
          </Pressable>
          <Pressable
            onPress={() => console.log("Settings")}
            // onPress={() => console.log("Back")}
          >
            {isAuthenticated && user?.avatar_url ? (
              <Image
                source={{ uri: user.avatar_url }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={require("@/assets/images/react-logo.png")}
                style={styles.profileImage}
              />
            )}
          </Pressable>
        </ThemedView>
        <ThemedView
          style={{
            width: "100%",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 12,
            height: 800,
            paddingVertical: "40%",
          }}
        >
          {/* List of photos quiz */}
          {quizzes.map((quiz) => (
            <Pressable
              key={quiz.id}
              style={{
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
              }}
              onPress={() =>
                router.push(`/photo-quiz/quiz/${slug}-quiz-${quiz.id}` as any)
              }
            >
              <ThemedText style={styles.photoQuizText}>
                {quiz.title}: {slug}
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
  photoQuizText: {
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
