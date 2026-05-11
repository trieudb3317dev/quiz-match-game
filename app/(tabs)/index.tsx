import { Image, Modal, Pressable, StyleSheet, View } from "react-native";

import { getGameTypes, signOut } from "@/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { loading, isAuthenticated, user } = useAuth();

  const [gameTypes, setGameTypes] = useState<any[]>([]);
  const [isProfile, setIsProfile] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const toggleProfileModal = () => {
    console.log("Toggling profile modal");
    setIsProfile(!isProfile);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.container}>
        {loading && (
          <ThemedText style={{ marginBottom: 20 }}>Loading...</ThemedText>
        )}
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            marginTop: 20,
            marginRight: 20,
            zIndex: 10,
          }}
          onPress={toggleProfileModal}
        >
          <Image
            source={
              isAuthenticated && user?.avatar_url
                ? { uri: user.avatar_url }
                : require("@/assets/images/react-logo.png")
            }
            style={styles.profileImage}
          />
        </Pressable>
        {/** Show modal to edit profile */}
        {isProfile && (
          <ThemedView style={styles.modal}>
            <Pressable
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 20,
              }}
              onPress={toggleProfileModal}
            >
              <IconSymbol size={20} color="#fff" name="x.square" />
            </Pressable>
            <ThemedView style={styles.cardModal}>
              {/** Link to edit profile */}
              <Pressable onPress={() => router.push("/profile" as any)}>
                <ThemedText style={styles.buttonText}>Edit Profile</ThemedText>
              </Pressable>
              <Pressable
                onPress={async () => {
                  await signOut();
                  router.replace("/(auth)" as any);
                }}
              >
                <ThemedText style={[styles.buttonText, { color: "#fff" }]}>
                  Logout
                </ThemedText>
              </Pressable>
              {/** Dark mode toggle */}
              <ThemedView style={styles.actionMode}>
                <Pressable onPress={() => console.log("Toggle Dark Mode")}>
                  <IconSymbol size={20} color="#fff" name="moon.circle" />
                </Pressable>
                <Pressable onPress={() => console.log("Toggle Dark Mode")}>
                  <IconSymbol size={20} color="#fff" name="sun.max.circle" />
                </Pressable>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
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
                game.key === "photo_quiz"
                  ? router.replace(`/${game.key.split("_").join("-")}` as any)
                  : setModalVisible(true)
              }
            >
              <ThemedText style={styles.buttonText}>{game.name}</ThemedText>
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
    position: "absolute",
    top: 0,
    right: 0,
  },
  modal: {
    position: "absolute",
    top: 40,
    right: 12,
    // slightly smaller, compact card anchored to top-right near profile image
    width: 220,
    backgroundColor: "rgba(12,12,12,0.92)",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    // subtle border and shadow for depth
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 50,
  },
  cardModal: {
    width: "100%",
    flexDirection: "column",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: "transparent",
    paddingBottom: 8,
  },
  actionMode: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    paddingVertical: 8,
    paddingHorizontal: 6,
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
});
