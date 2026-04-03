import {
  acceptRoomInvitation,
  checkInvitationStatus,
  getInvitations,
  getRooms,
  rejectRoomInvitation,
} from "@/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

const sampleGroups = ["Group A", "Group B", "Group C", "Group D", "Group E"];

export default function RoomListScreen() {
  const router = useRouter();
  const [rooms, setRooms] = React.useState<any[]>([]);
  const [invitations, setInvitations] = React.useState<any[]>([]);
  const [roomHasInvitations, setRoomHasInvitations] = React.useState<{
    [roomId: number]: boolean;
  }>({});

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
            .filter((room) => !!roomHasInvitations[room.id])
            .map((room) => (
              <Pressable
                key={room.id}
                style={styles.groupButton}
                onPress={() =>
                  router.push(`/room/waiting?roomId=${room.id}` as any)
                }
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
