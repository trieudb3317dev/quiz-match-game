import { getGameTypeByKey } from "@/api/game";
import {
  leaveRoom as apiLeaveRoom,
  getMemberRooms,
  getRoomById,
  updateNicknameAndAvatar,
} from "@/api/room";
import { uploadFileRN } from "@/api/upload";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useRoomSocket } from "@/providers/RoomSocketProvider";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

type Params = { code?: string; roomId?: string };

export default function WaitingRoom() {
  const { height } = useWindowDimensions();
  const { user } = useAuth();
  const params = useLocalSearchParams<Params>();
  const router = useRouter();
  const code = params?.code || "000000";
  const [members, setMembers] = React.useState<any[]>([]);
  const [isFormModalVisible, setFormModalVisible] = React.useState(false);
  const [nickname, setNickname] = React.useState<string>("");
  const [avatarUrl, setAvatarUrl] = React.useState<string>("");
  const [roomDetails, setRoomDetails] = React.useState<any>(null);
  const [gameId, setGameId] = React.useState<number | null>(null);

  const expoExtra =
    (Constants as any).expoConfig?.extra ||
    (Constants as any).manifest?.extra ||
    {};

  // derive resource values (used to build websocket path)
  const resourceTypeDerived =
    (roomDetails && (roomDetails.resource_type ?? roomDetails.resourceType)) ||
    "quiz";
  const resourceIdDerived =
    (roomDetails && (roomDetails.resource_id ?? roomDetails.resourceId)) || 1;

  const wsPath =
    gameId && params?.roomId
      ? `${expoExtra?.NEXT_PUBLIC_WS_BASE_URL || ""}${expoExtra?.NEXT_PUBLIC_WS_PREFIX || "/ws"}/group-session/gameId/${gameId}/resource-type/${resourceTypeDerived}/resource-id/${resourceIdDerived}/room/${params.roomId}`
      : "";

  // consume shared socket from provider
  const {
    setPath,
    joinRoom,
    leaveRoom,
    joinSession,
    requestGameResult,
    connected: wsConnected,
    lastMessage: wsLastMessage,
    send,
    addListener,
    removeListener,
    connect: wsConnect,
    disconnect: wsDisconnect,
    path: currentPath,
  } = useRoomSocket();

  if (params?.roomId && isNaN(Number(params.roomId))) {
    console.error("Invalid room ID");
    return;
  }

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

    const fetchRoomInfo = async () => {
      try {
        if (!params?.roomId) return;
        console.log("Fetching room info for roomId:", params.roomId);
        const roomInfo = await getRoomById(Number(params.roomId));
        console.log("Fetched room info:", roomInfo.data);
        setRoomDetails(roomInfo.data || null);
        // Do something with the room info if needed
      } catch (error) {
        console.error("Error fetching room info:", error);
      }
    };

    fetchMemberRooms();
    fetchRoomInfo();
    // also resolve gameId from key param if provided (forwarded from index)
    const resolveGameId = async () => {
      try {
        const rawKey = ((params as any)?.key as string) || "photo-quiz";
        const gameKey = rawKey.replace(/-/g, "_");
        const gt = await getGameTypeByKey(gameKey);
        const id = gt?.data?.id ?? gt?.id ?? null;
        setGameId(id);
      } catch (e) {
        console.warn("Failed to resolve gameId from key", e);
      }
    };
    resolveGameId();
  }, [params?.roomId]);

  // register listener and join via websocket when gameId + roomDetails available
  React.useEffect(() => {
    if (!params?.roomId || !roomDetails || !gameId) return;

    const handler = (msg: any) => {
      console.log("waiting: ws message received:", msg);
      const t = msg?.type;
      if (!t) return;
      if (t === "room_members") {
        // Normalize shapes: server may send { members: { data: [...] } } or { members: [...] } or { data: [...] }
        let list = msg?.members?.data ?? msg?.members ?? msg?.data ?? [];
        console.log("waiting: raw room_members list=", list);
        if (
          list &&
          typeof list === "object" &&
          !Array.isArray(list) &&
          list.data
        ) {
          list = list.data;
        }
        console.log(
          "waiting: normalized room_members count=",
          (list || []).length,
        );
        setMembers(list || []);
      }
      // When someone (including the current user) joins the room the server may
      // emit a `joined_room` or similar. Refresh the members list via API to
      // ensure we have the latest snapshot. Some backends also emit incremental
      // events; we call the API for safety and to keep UI consistent.
      if (t === "joined_room" || t === "member_joined" || t === "member_left") {
        (async () => {
          try {
            console.log("waiting: refresh members due to event:", t);
            const memberRooms = await getMemberRooms(Number(params.roomId));
            setMembers(memberRooms.data || []);
            console.log(
              "waiting: refreshed members count=",
              (memberRooms?.data || []).length,
            );
          } catch (e) {
            console.warn("waiting: refresh members failed", e);
          }
        })();
      }
      if (t === "joined_session") {
        const sessionId = msg?.room_session_id ?? msg?.session_data?.id ?? null;
        if (sessionId) {
          try {
            joinSession(sessionId as number);
          } catch (e) {
            console.error("ws joinSession error", e);
          }
        }
      }
      // When a session is created/started for this room, navigate players to the quiz screen.
      if (t === "session_created" || t === "session_started") {
        try {
          const sessionId =
            msg?.room_session_id ?? msg?.session_data?.id ?? null;
          const resource = msg?.session_data ?? msg?.session_data ?? null;
          const resourceId =
            resource?.resource_id ?? resource?.resourceId ?? null;
          const resourceType =
            resource?.resource_type ?? resource?.resourceType ?? "quiz";
          // use forwarded key param to determine route prefix (e.g., photo-quiz)
          const rawKey = ((params as any)?.key as string) || "photo-quiz";
          const gameKey = rawKey; // keep original formatting for route
          if (resourceId && sessionId) {
            const slug = `${gameKey}-quiz-${resourceId}`;
            // navigate and include roomSessionId and group param
            router.push(
              `/photo-quiz/quiz/${slug}-quiz-${resourceId}?group=1&roomSessionId=${sessionId}` as any,
            );
          }
        } catch (e) {
          console.warn("failed to navigate on session event", e);
        }
      }
      if (t === "game_result") {
        console.log("received game_result", msg);
        // optional: router.push to scoreboard screen with payload
      }
    };

    const unsub = addListener(handler);
    // Ensure provider uses the path for this room so the shared socket will
    // connect to the correct endpoint and this component will receive events.
    try {
      if (wsPath && currentPath !== wsPath) {
        console.log("waiting: setting provider path:", wsPath);
        setPath(wsPath);
      }
    } catch (e) {
      console.warn("waiting: setPath failed", e);
    }

    // If connected, request to join the room on this socket so server will
    // emit room_members to this connection (server usually broadcasts to
    // connections that have executed join_room).
    try {
      if (wsConnected) {
        try {
          console.log(
            "waiting: websocket connected - sending join_room",
            params.roomId,
          );
          joinRoom && joinRoom(Number(params.roomId));
        } catch (e) {
          console.warn("joinRoom error", e);
        }
      }
    } catch (e) {
      /* ignore */
    }

    return () => {
      try {
        unsub?.();
      } catch (e) {}
      // Do NOT disconnect the shared RoomSocketProvider here — provider
      // lives at app root and should manage socket lifecycle across screens.
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    params?.roomId,
    roomDetails,
    gameId,
    addListener,
    joinSession,
    wsConnected,
    setPath,
    joinRoom,
    currentPath,
  ]);

  console.log("detail room", roomDetails);

  const handleStart = () => {
    try {
      console.log("Start button pressed - sending join_room to start game");
      // Start new session to play the game
      joinSession && joinSession();
    } catch (e: any) {
      console.error("Error starting game", e);
      Alert.alert("Error", "Could not start game: " + (e?.message || e));
    }
  };

  const toggleFormModal = () => {
    if (!isFormModalVisible) {
      // populate fields from current user when opening
      setNickname((user && (user.nickname || user.name || "")) || "");
      setAvatarUrl((user && (user.avatar_url || user.avatarUrl || "")) || "");
    }
    setFormModalVisible(!isFormModalVisible);
  };

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Permission to access photos is required to upload an avatar.",
        );
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if (!result.canceled) {
        // new ImagePicker returns assets array
        const asset = (result as any).assets?.[0];
        if (asset && asset.uri) {
          setAvatarUrl(asset.uri as string);
        }
      }
    } catch (e) {
      console.error("Image picker error", e);
      Alert.alert("Image picker error", String(e));
    }
  };

  const handleLeave = async () => {
    if (!params?.roomId) {
      router.back();
      return;
    }
    try {
      // notify via websocket (best-effort)
      try {
        leaveRoom && leaveRoom(Number(params.roomId));
      } catch (e) {
        // ignore websocket errors
      }
      // call API to leave room
      await apiLeaveRoom(Number(params.roomId));
      router.push("/room" as any);
    } catch (e: any) {
      console.error("Leave room failed", e);
      Alert.alert("Leave failed", e?.message || "Could not leave room");
    }
  };

  const handleSaveProfile = async () => {
    if (!params?.roomId) return;
    try {
      let avatar_to_use = avatarUrl;

      // If user supplied a local file uri (starts with file: or content:), upload it first
      if (
        avatarUrl &&
        (avatarUrl.startsWith("file:") || avatarUrl.startsWith("content:"))
      ) {
        const uploadResult = await uploadFileRN({ uri: avatarUrl });
        avatar_to_use = uploadResult?.url || avatar_to_use;
      }

      await updateNicknameAndAvatar(
        Number(params.roomId),
        nickname,
        avatar_to_use,
      );
      // refresh members
      const memberRooms = await getMemberRooms(Number(params.roomId));
      setMembers(memberRooms.data || []);
      setFormModalVisible(false);
    } catch (e: any) {
      console.error("Update profile failed", e);
      Alert.alert("Update failed", e?.message || "Could not update profile");
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#5B1D7A", dark: "#2B0F3B" }}
      style={{ position: "relative", height: height }}
    >
      <ThemedView style={[styles.container, { height: height }]}>
        <Pressable style={styles.arrowBack} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={20} color="#fff" />
        </Pressable>
        <ThemedText style={styles.codeLabel}>WAITING ROOM</ThemedText>
        <FlatList
          data={members}
          keyExtractor={(i) => String(i.id)}
          numColumns={3}
          style={{ width: "90%", marginTop: 16, height: "60%" }}
          renderItem={({ item }) => (
            <View style={styles.userCell}>
              <View style={styles.avatar}>
                {item.avatar_url ? (
                  <Image
                    source={{ uri: item.avatar_url }}
                    style={{ width: 70, height: 70, borderRadius: 35 }}
                  />
                ) : (
                  <Image
                    source={require("@/assets/images/react-logo.png")}
                    style={{ width: 70, height: 70, borderRadius: 35 }}
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
        {user?.is_editor && (
          <Pressable style={styles.startButton} onPress={handleStart}>
            <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
              Start Game
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>
      {/** Modal form update (only visible when toggled) */}
      {isFormModalVisible && (
        <ThemedView style={[styles.formModal, { height: height }]}>
          <Pressable style={styles.backdrop} onPress={toggleFormModal} />
          <ThemedView style={styles.cardModal}>
            <Pressable
              style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}
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
              <ThemedView style={styles.inputField}>
                <ThemedText style={styles.inputLabel}>Avatar URL</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your avatar URL"
                  placeholderTextColor="#bbb"
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                />
              </ThemedView>
              <ThemedView
                style={{
                  width: "100%",
                  marginTop: 8,
                  flexDirection: "row",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <Pressable style={styles.pickButton} onPress={pickImage}>
                  <ThemedText style={{ color: "#fff" }}>
                    Choose Image
                  </ThemedText>
                </Pressable>
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.previewAvatar}
                  />
                ) : null}
              </ThemedView>
            </ThemedView>
            <ThemedView style={styles.modalFooter}>
              <Pressable style={styles.cancelButton} onPress={toggleFormModal}>
                <ThemedText style={{ color: "#fff" }}>Cancel</ThemedText>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSaveProfile}>
                <ThemedText style={{ color: "#fff", fontWeight: "700" }}>
                  Save
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      )}
      {/* current user avatar / leave action in bottom-left */}
      <ThemedView style={styles.meAvatarWrap}>
        <Pressable
          style={{
            width: 80,
            height: 40,
            backgroundColor: "rgba(255, 255, 255, 0.11)",
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
          }}
          onPress={handleLeave}
        >
          <IconSymbol name="arrow.left" size={20} color="#fff" />
          <ThemedText style={{ color: "#fff", fontSize: 12 }}>Leave</ThemedText>
        </Pressable>
        <Pressable style={{ alignItems: "center", justifyContent: "center" }}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.meAvatar} />
          ) : (
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={styles.meAvatar}
            />
          )}
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    position: "relative",
    flexDirection: "column",
    gap: 12,
    // paddingVertical: 40,
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
    marginHorizontal: 8,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  codeLabel: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFD84D",
    backgroundColor: "transparent",
    paddingVertical: 12,
  },
  userName: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    textAlign: "center",
    marginTop: 8,
    paddingBottom: 4,
  },
  startButton: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    backgroundColor: "#0ABF7B",
    shadowColor: "#0ABF7B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
  },
  formModal: {
    // flex: 1,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    fontSize: 14,
    fontWeight: "500",
    color: "#ddd",
    // backgroundColor: "rgba(247, 66, 66, 0.49)",
    backgroundColor: "rgba(0, 0, 0, 0.01)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardModal: {
    width: "80%",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.61)",
    borderRadius: 6,
    padding: 20,
    marginTop: 8,
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
    color: "#fff",
  },
  bodyForm: {
    marginTop: 20,
    flexDirection: "column",
    gap: 16,
  },
  inputField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.61)",
    borderRadius: 4,
    padding: 8,
    marginTop: 4,
  },
  pickButton: {
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  previewAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  meAvatarWrap: {
    position: "absolute",
    bottom: 140,
    right: 0,
    left: 0,
    width: "100%",
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  meAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
});
