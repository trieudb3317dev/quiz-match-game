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
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type Params = { slug?: string };

export default function PhotoQuizSlug() {
  const params = useLocalSearchParams<Params>();
  const slug = params?.slug;
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [gameTypeKey, setGameTypeKey] = useState<string>("");

  const expoExtra =
    (Constants as any).manifest?.extra ||
    (Constants as any).expoConfig?.extra ||
    {};

  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      console.log("Current Path:", path);
      // Extract game type key from the path
      const pathParts = path.split("/");
      if (pathParts.length > 1) {
        setGameTypeKey(pathParts[1]);
      }
    }
  }, []);
  console.log("Game Type Key:", gameTypeKey);

  const {} = useSoloWebsocket({
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
            onPress={() => setModalVisible(true)}
            // onPress={() => router.push(`/room?key=${gameTypeKey}` as any)}
          >
            <IconSymbol size={20} color="#fff" name="person" />
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
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText type="title" style={styles.modalTitle}>
              Tham gia phòng!
            </ThemedText>
            <ThemedText style={styles.modalBody}>
              Hệ thống chưa hoàn thiện, vui lòng quay lại sau.
            </ThemedText>
            <Pressable
              style={[styles.saveButton, styles.modalButton]}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.modalButtonText}>Đóng</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    borderRadius: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "82%",
    backgroundColor: "#121217",
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    color: "#000",
    padding: 12,
    borderRadius: 8,
  },
  saveText: {
    fontSize: 16,
    color: "#000",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  modalBody: {
    color: "#e6e6e6",
    marginTop: 10,
    textAlign: "center",
  },
  modalButton: {
    marginTop: 14,
    width: 120,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "700",
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
