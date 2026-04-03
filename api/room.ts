import Constants from "expo-constants";

const BASE_URL =
  Constants.expoConfig?.extra?.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";
const PREFIX = Constants.expoConfig?.extra?.NEXT_PUBLIC_API_PREFIX || "/api/v1";
const API_URL = `${BASE_URL}${PREFIX}`;

// Game-related API functions
import { authFetch } from "./request";

export async function createRoom(gameTypeId: number, roomData: any) {
  try {
    const response = await authFetch(
      `${API_URL}/rooms/game-type/${gameTypeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
}

export async function getRooms() {
  try {
    const response = await authFetch(`${API_URL}/rooms`, {
      method: "GET",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching rooms:", error);
    throw error;
  }
}

export async function getRoomById(roomId: number) {
  try {
    const response = await authFetch(`${API_URL}/rooms/${roomId}`, {
      method: "GET",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching room:", error);
    throw error;
  }
}

export async function joinRoom(roomId: number) {
  try {
    const response = await authFetch(`${API_URL}/rooms/${roomId}/join`, {
      method: "POST",
    });
    return response.json();
  } catch (error) {
    console.error("Error joining room:", error);
    throw error;
  }
}

export async function leaveRoom(roomId: number) {
  try {
    const response = await authFetch(`${API_URL}/rooms/${roomId}/leave`, {
      method: "POST",
    });
    return response.json();
  } catch (error) {
    console.error("Error leaving room:", error);
    throw error;
  }
}

export async function getMemberRooms(roomId: number) {
  try {
    const response = await authFetch(`${API_URL}/rooms/${roomId}/members`, {
      method: "GET",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching member rooms:", error);
    throw error;
  }
}

export async function getMemberInfo(roomId: number, memberId: number) {
  try {
    const response = await authFetch(
      `${API_URL}/rooms/${roomId}/member/${memberId}`,
      {
        method: "GET",
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error fetching member info:", error);
    throw error;
  }
}

export async function updateNicknameAndAvatar(
  roomId: number,
  nickname: string,
  avatarUrl: string,
) {
  try {
    const response = await authFetch(`${API_URL}/rooms/${roomId}/member`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname: nickname, avatarUrl: avatarUrl }),
    });
    return response.json();
  } catch (error) {
    console.error("Error updating nickname and avatar:", error);
    throw error;
  }
}

export async function inviteToRoom(roomId: number, userId: number) {
  try {
    const response = await authFetch(
      `${API_URL}/rooms/${roomId}/invite/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error inviting to room:", error);
    throw error;
  }
}

export async function acceptRoomInvitation(invitationId: number) {
  try {
    const response = await authFetch(
      `${API_URL}/rooms/invitation/${invitationId}/accept`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error accepting room invitation:", error);
    throw error;
  }
}

export async function rejectRoomInvitation(invitationId: number) {
  try {
    const response = await authFetch(
      `${API_URL}/rooms/invitation/${invitationId}/decline`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error rejecting room invitation:", error);
    throw error;
  }
}

export async function getInvitations() {
  try {
    const response = await authFetch(`${API_URL}/rooms/invitations/all`, {
      method: "GET",
    });
    return response.json();
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
}

export async function checkInvitationStatus(roomId: number) {
  try {
    const response = await authFetch(
      `${API_URL}/rooms/${roomId}/check-invitation`,
      {
        method: "GET",
      },
    );
    return response.json();
  } catch (error) {
    console.error("Error checking invitation status:", error);
    throw error;
  }
}
