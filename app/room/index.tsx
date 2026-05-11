import {
  acceptRoomInvitation,
  checkInvitationStatus,
  getGameTypeByKey,
  getInvitations,
  getRooms,
  rejectRoomInvitation,
} from "@/api";
// game id will be resolved in waiting screen; don't fetch here
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { useRoomSocket } from "@/providers/RoomSocketProvider";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import React from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";

const sampleGroups = ["Group A", "Group B", "Group C", "Group D", "Group E"];

type params = {
  key: string;
};

export default function RoomListScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [invitations, setInvitations] = React.useState<any[]>([]);
  const [roomHasInvitations, setRoomHasInvitations] = React.useState<{
    [roomId: number]: boolean;
  }>({});
  // const [gameKey, setGameKey] = React.useState<string>("");

  const params = useSearchParams();

  // read url params (e.g. ?key=photo-quiz) and forward to waiting screen

  const expoExtra =
    (Constants as any).expoConfig?.extra ||
    (Constants as any).manifest?.extra ||
    {};

  // use shared socket provider
  const {
    setPath: setWsPath,
    joinRoom: wsJoinRoom,
    connect: wsConnect,
    disconnect: wsDisconnect,
    send: wsSend,
  } = useRoomSocket();

  React.useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomsData = await getRooms();
        setRooms(roomsData.data || []);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    fetchRooms();
  }, []);

  React.useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const invitationsData = await getInvitations();
        setInvitations(invitationsData.data || []);
      } catch (error) {
        console.error("Error fetching invitations:", error);
      }
    };

    fetchInvitations();
  }, []);

  React.useEffect(() => {
    const checkInvitations = async () => {
      try {
        rooms.forEach(async (room) => {
          const hasInvitation = await checkInvitationStatus(room.id);
          console.log(`Room ${room.id} has invitation:`, hasInvitation);

          if (hasInvitation && hasInvitation?.has_been_invited) {
            setRoomHasInvitations((prev) => ({
              ...prev,
              [room.id]: true,
            }));
          } else {
            setRoomHasInvitations((prev) => ({
              ...prev,
              [room.id]: false,
            }));
          }
        });
      } catch (error) {
        console.error("Error checking invitation status:", error);
      }
    };

    checkInvitations();
  }, [invitations, rooms]);

  // React.useEffect(() => {
  //   const fetchGameTypeByKey = async (key: string) => {
  //     try {
  //       const gameTypeData = await getGameTypeByKey(key);
  //       console.log("Fetched game type details:", gameTypeData);
  //       setGameKey(gameTypeData.key);
  //     } catch (error) {
  //       console.error(`Error fetching game type with key ${key}:`, error);
  //     }
  //   };

  //   fetchGameTypeByKey(gameKey);
  // }, [gameKey]);

  console.log("roomHasInvitations", roomHasInvitations);

  const handleAccept = async (inviteId: number) => {
    try {
      await acceptRoomInvitation(inviteId);
      // Remove the accepted invitation from the list
      setInvitations((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (error) {
      console.error("Error accepting room invitation:", error);
    }
  };

  const handleReject = async (inviteId: number) => {
    try {
      await rejectRoomInvitation(inviteId);
      // Remove the rejected invitation from the list
      setInvitations((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (error) {
      console.error("Error rejecting room invitation:", error);
    }
  };

  const handleJoinRoom = async (roomId: number) => {
    // For demo, navigate to waiting room with roomId as query param
    if (
      !roomHasInvitations[roomId] ||
      rooms.find((room) => room.id === roomId)?.host_id !== user?.id
    )
      Alert.alert("Join room failed", "You are not invited to this room.");

    try {
      const room = rooms.find((r) => r.id === roomId) as any;

      // read key param to forward into waiting screen so waiting can connect WS
      const rawKey = ((params as any)?.key as string) || "photo-quiz";
      const gameKey = rawKey; // waiting will convert '-' to '_' as needed

      const gameTypeData = await getGameTypeByKey(gameKey.replace(/-/g, "_"));
      console.log("gameTypeData: ", gameTypeData);

      const builtWsPath =
        gameTypeData && room
          ? `${expoExtra?.NEXT_PUBLIC_WS_BASE_URL || ""}${expoExtra?.NEXT_PUBLIC_WS_PREFIX || "/ws"}/group-session/gameId/${gameTypeData.id}/resource-type/${room.resource_type}/resource-id/${room.resource_id}/room/${room.id}`
          : "";

      // set path on top-level hook (this will trigger autoConnect)
      setWsPath(builtWsPath);

      try {
        if (builtWsPath) {
          // wsConnect will be triggered by setWsPath + autoConnect, but ensure joinRoom is sent
          // small delay to allow connection; if wsJoinRoom is ready it will send immediately
          try {
            console.log("Attempting WS joinRoom for roomId:", roomId);
            wsJoinRoom && wsJoinRoom(Number(roomId));
          } catch (e) {
            // ignore
            console.log("e: ", e);
          }
        }
      } catch (e) {
        console.warn("ws join attempt failed", e);
      }

      // Attempt API join (safe) then try to join via WS and navigate to waiting
      // try {
      //   const isJoined = await checkRoomJoined(roomId);
      //   if (!isJoined) await joinRoom(roomId);
      // } catch (e) {
      //   console.warn("API joinRoom failed (continuing to waiting)", e);
      // }

      // best-effort WS join using top-level hoo

      router.push(
        `/room/waiting?roomId=${roomId}&key=${encodeURIComponent(gameKey)}&difficulty=${encodeURIComponent(room.difficulty || "medium")}` as any,
      );
      Alert.alert("Joined room", `You have joined room ${roomId}`);
    } catch (error: any) {
      console.error("Error joining room:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#5B1D7A", dark: "#2B0F3B" }}
    >
      <ThemedView style={styles.container}>
        <Pressable style={styles.arrowBack} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={20} color="#fff" />
        </Pressable>

        <ThemedView style={styles.headerRow}>
          <ThemedText style={styles.title}>All Rooms</ThemedText>
          <ThemedView style={styles.headerIcons}>
            <Pressable onPress={() => router.push("/room/create" as any)}>
              <IconSymbol name="plus" size={20} color="#fff" />
            </Pressable>
          </ThemedView>
        </ThemedView>

        {/** check if there is notifications request to invitation */}
        <ThemedView style={styles.notifications}>
          <ThemedText style={styles.notificationText}>
            You have pending invitations!
          </ThemedText>
        </ThemedView>

        {invitations &&
          invitations.length > 0 &&
          invitations.map((invite) => (
            <ThemedView key={invite.id} style={styles.cardNotifications}>
              <ThemedView style={styles.notifyInfo}>
                <ThemedText style={styles.notifyTitle}>
                  New Invitation
                </ThemedText>
                <ThemedText style={styles.notifyDesc}>
                  You have a new invitation to join "
                  {invite.room?.title || "Room 12345"}"
                </ThemedText>
                <ThemedView style={styles.notifyActions}>
                  <Pressable
                    style={styles.acceptButton}
                    onPress={() => handleAccept(invite.id)}
                  >
                    <ThemedText style={styles.acceptText}>Accept</ThemedText>
                  </Pressable>
                  <Pressable
                    style={styles.declineButton}
                    onPress={() => handleReject(invite.id)}
                  >
                    <ThemedText style={styles.declineText}>Decline</ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ))}

        <View style={styles.groupsGrid}>
          {rooms
            .filter(
              (room) =>
                !!roomHasInvitations[room.id] || room.host_id === user?.id,
            )
            .map((room) => (
              <Pressable
                key={room.id}
                style={styles.groupButton}
                onPress={() => {
                  console.log("is join: ", roomHasInvitations[room.id]);
                  handleJoinRoom(room.id);
                }}
              >
                <ThemedText style={styles.groupText}>{room.title}</ThemedText>
              </Pressable>
            ))}
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
  headerRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  notifications: {
    width: "90%",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "700",
  },
  cardNotifications: {
    width: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderRadius: 8,
  },
  notifyInfo: {
    padding: 16,
  },
  notifyTitle: {
    color: "#fff",
    fontWeight: "700",
  },
  notifyDesc: {
    color: "#fff",
    marginTop: 8,
  },
  notifyActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  acceptButton: {
    backgroundColor: "rgba(46, 229, 157, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  acceptText: {
    color: "#2EE59D",
    fontWeight: "700",
  },
  declineButton: {
    backgroundColor: "rgba(255, 77, 77, 0.2)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  declineText: {
    color: "#FF4D4D",
    fontWeight: "700",
  },
  groupsGrid: {
    width: "90%",
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  groupButton: {
    width: "48%",
    backgroundColor: "rgba(255,255,255,0.06)",
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  groupText: {
    color: "#fff",
    fontWeight: "700",
  },
});
