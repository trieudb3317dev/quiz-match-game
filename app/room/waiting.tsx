import { getMemberRooms } from "@/api/room";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

type Params = { code?: string; roomId?: string };

export default function WaitingRoom() {
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const code = params?.code || "000000";
  const [members, setMembers] = React.useState<any[]>([]);
  const [isFormModalVisible, setFormModalVisible] = React.useState(false);
  const [nickname, setNickname] = React.useState<string>("");
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");

  React.useEffect(() => {
    const fetchMemberRooms = async () => {
      try {
        if (!params?.roomId) return;
        const memberRooms = await getMemberRooms(Number(params.roomId));
        setMembers(memberRooms.data || []);
      } catch (error) {
        console.error("Error fetching member rooms:", error);
      }
    };

    fetchMemberRooms();
  }, [params?.roomId]);

  const handleStart = () => {
    // For demo, navigate back to home or quiz list
    // router.push("/" as any);
    console.log("Start game with members:", members);
  };

  const toggleFormModal = () => {
    setFormModalVisible(!isFormModalVisible);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#5B1D7A", dark: "#2B0F3B" }}
    >
      <ThemedView style={styles.container}>
        <Pressable style={styles.arrowBack} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={20} color="#fff" />
        </Pressable>
        <ThemedText style={styles.codeLabel}>WAITING ROOM</ThemedText>
        <FlatList
          data={members}
          keyExtractor={(i) => String(i.id)}
          numColumns={3}
          style={{ width: "90%", marginTop: 16 }}
          renderItem={({ item }) => (
            <View style={styles.userCell}>
              <View style={styles.avatar}>
                {item.avatar_url !== null && item.avatar_url !== undefined ? (
                  <Image
                    source={{ uri: item.avatar_url }}
                    style={{ width: 48, height: 48 }}
                  />
                ) : (
                  <Image
                    source={require("@/assets/images/react-logo.png")}
                    style={{ width: 48, height: 48 }}
                  />
                )}
                <Pressable
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                  }}
                  onPress={toggleFormModal}
                >
                  <IconSymbol name="pencil.circle" size={20} color="#fff" />
                </Pressable>
              </View>
              <ThemedText style={styles.userName}>
                {item.nickname || "Unknown User"}
              </ThemedText>
            </View>
          )}
        />
        {/** Modal form update (only visible when toggled) */}
        {isFormModalVisible && (
          <ThemedView style={styles.formModal}>
            <Pressable style={styles.backdrop} onPress={toggleFormModal} />
            <ThemedView style={styles.cardModal}>
              <Pressable
                style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
                onPress={toggleFormModal}
              >
                <IconSymbol name="x.square" size={20} color="#fff" />
              </Pressable>
              <ThemedView style={styles.headerForm}>
                <ThemedText style={styles.formTitle}>Update Profile</ThemedText>
              </ThemedView>
              <ThemedView style={styles.bodyForm}>
                {/* Text input fields for updating profile would go here */}
                <ThemedView style={styles.inputField}>
                  <ThemedText style={styles.inputLabel}>Nickname</ThemedText>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your nickname"
                    placeholderTextColor="#bbb"
                    value={nickname}
                    onChangeText={setNickname}
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.modalFooter}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={toggleFormModal}
                >
                  <ThemedText style={{ color: "#fff" }}>Cancel</ThemedText>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleStart}>
                  <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
                    Save
                  </ThemedText>
                </Pressable>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 800,
    alignItems: "center",
    paddingVertical: 40,
    position: "relative",
  },
  arrowBack: {
    position: "absolute",
    top: 20,
    left: 16,
  },
  userCell: {
    width: "33%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: "50%",
  },
  codeLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFD84D",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    width: 72,
    height: 72,
    maxHeight: "72%",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },
  userName: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  startButton: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    alignItems: "center",
  },
  formModal: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 800,
    fontSize: 14,
    fontWeight: "500",
    color: "#ddd",
  },
  cardModal: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.02)",
    color: "#fff",
    position: "relative",
  },
  modalFooter: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: "#0ABF7B",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  headerForm: {
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  bodyForm: {
    marginTop: 20,
  },
  inputField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
});
