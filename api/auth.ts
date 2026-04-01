// Auth functions
import Constants from "expo-constants";

const BASE_URL =
  Constants.expoConfig?.extra?.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";
const PREFIX = Constants.expoConfig?.extra?.NEXT_PUBLIC_API_PREFIX || "/api/v1";
const API_URL = `${BASE_URL}${PREFIX}`;

export async function signIn(username: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error("Sign-in failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
}

export async function signUp(
  username: string,
  email: string,
  password: string,
) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      throw new Error("Sign-up failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
}

export async function signOut() {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Sign-out failed");
    }
    return await response.json();
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const err: any = new Error("Failed to fetch current user");
      err.status = response.status;
      // try to include any JSON error body for better diagnostics
      try {
        const body = await response.json();
        err.body = body;
      } catch {}
      throw err;
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
}

export async function refreshToken() {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const err: any = new Error("Failed to refresh token");
      err.status = response.status;
      try {
        const body = await response.json();
        err.body = body;
      } catch {}
      throw err;
    }
    return await response.json();
  } catch (error) {
    console.error("Error refreshing token:", error);
    throw error;
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const response = await fetch(`${API_URL}/auth/request-password-reset`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) {
      throw new Error("Failed to request password reset");
    }
    return await response.json();
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
}

export async function resetPassword(token: string, newPassword: string) {
  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!response.ok) {
      throw new Error("Failed to reset password");
    }
    return await response.json();
  } catch (error) {
    console.error("Error resetting password:", error);
    throw error;
  }
}

export async function updateProfile(username: string, email: string) {
  try {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email }),
    });
    if (!response.ok) {
      throw new Error("Failed to update profile");
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
) {
  try {
    const response = await fetch(`${API_URL}/auth/change-password`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!response.ok) {
      throw new Error("Failed to change password");
    }
    return await response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

export async function deleteAccount() {
  try {
    const response = await fetch(`${API_URL}/auth/delete-account`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete account");
    }
    return await response.json();
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}

export async function verifyEmail(token: string) {
  try {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw new Error("Failed to verify email");
    }
    return await response.json();
  } catch (error) {
    console.error("Error verifying email:", error);
    throw error;
  }
}
