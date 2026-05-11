import { updateProfile } from "@/api/auth";
import { uploadFileRN } from "@/api/upload";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    TextInput,
} from "react-native";

export default function ProfileScreen() {
  const { user, isAuthenticated, reloadUser, signOut } = useAuth();
  const router = useRouter();

  const [gender, setGender] = useState(user?.gender ?? "other");
  const [address, setAddress] = useState(user?.address ?? "");
  const [dayOfBirth, setDayOfBirth] = useState(user?.day_of_birth ?? "");
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // If avatar is a local file, upload it first
      let avatar_to_use = avatarUrl;
      if (
        avatarUrl &&
        (avatarUrl.startsWith("file:") || avatarUrl.startsWith("content:"))
      ) {
        const uploadResult = await uploadFileRN({ uri: avatarUrl });
        // server response shape may vary; try common keys
        avatar_to_use =
          uploadResult?.url || uploadResult?.secure_url || avatar_to_use;
      }

      // Build profile object and send only provided fields
      const profilePayload: Record<string, any> = {
        gender,
        full_name: fullName,
        day_of_birth: dayOfBirth,
        address,
        phone_number: phone,
      };
      if (avatar_to_use) profilePayload.avatar_url = avatar_to_use;

      await updateProfile(profilePayload);
      // optionally the backend might accept other profile fields via a different endpoint
      // reload auth user state
      await reloadUser();
      setMessage("Profile updated successfully");
    } catch (err: any) {
      setMessage(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        setMessage("Permission to access media library denied");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      // Newer Expo returns { canceled, assets: [{ uri }] }
      if ((result as any).canceled === false || !(result as any).canceled) {
        const assets = (result as any).assets || [];
        const uri = assets.length ? assets[0].uri : (result as any).uri;
        if (uri) setAvatarUrl(uri);
      }
    } catch (e: any) {
      console.error("Image pick failed", e);
      setMessage("Failed to pick image: " + (e?.message || String(e)));
    }
  };

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
            borderRadius: 999,
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

        <Pressable
          style={{
            alignSelf: "center",
            position: "absolute",
            top: 0,
            right: 0,
            padding: 12,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            borderRadius: 999,
            zIndex: 1,
          }}
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

        <ThemedText type="title" style={styles.title}>
          Account Profile
        </ThemedText>

        <ThemedText style={styles.label}>Gioi tinh</ThemedText>
        <TextInput
          style={styles.input}
          value={gender}
          onChangeText={setGender}
        />

        <ThemedText style={styles.label}>Dia chi</ThemedText>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          keyboardType="email-address"
        />
        <ThemedText style={styles.label}>Ngay sinh</ThemedText>
        <TextInput
          style={styles.input}
          value={dayOfBirth}
          onChangeText={setDayOfBirth}
          keyboardType="numeric"
        />
        <ThemedText style={styles.label}>Full name</ThemedText>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
        />

        <ThemedText style={styles.label}>Phone</ThemedText>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <ThemedText style={styles.label}>Avatar URL</ThemedText>
        <TextInput
          style={styles.input}
          value={avatarUrl}
          onChangeText={setAvatarUrl}
        />

        <Pressable
          style={[styles.saveButton, { backgroundColor: "#444", marginTop: 8 }]}
          onPress={pickImage}
        >
          <ThemedText style={styles.saveText}>
            Pick avatar from gallery
          </ThemedText>
        </Pressable>

        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 120, height: 120, borderRadius: 8, marginTop: 8 }}
          />
        ) : null}

        {message ? (
          <ThemedText style={styles.message}>{message}</ThemedText>
        ) : null}

        <Pressable
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.saveText}>Save</ThemedText>
          )}
        </Pressable>

        <Pressable
          style={[styles.saveButton, { backgroundColor: "#666", marginTop: 8 }]}
          onPress={async () => {
            await signOut();
            router.replace("/(auth)" as any);
          }}
        >
          <ThemedText style={styles.saveText}>Sign out</ThemedText>
        </Pressable>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 50,
    paddingHorizontal: 20,
    gap: 12,
    position: "relative",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
  message: {
    marginTop: 8,
    color: "green",
  },
  icon: {
    backgroundColor: "transparent",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
