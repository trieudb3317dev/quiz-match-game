import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

export default function Scoreboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const parsedResult = useMemo(() => {
    const raw = params?.result as string | undefined;
    if (!raw) return null;
    try {
      const decoded = decodeURIComponent(raw);
      return JSON.parse(decoded);
    } catch (e) {
      try {
        // fallback if not encoded
        return JSON.parse(raw as string);
      } catch (err) {
        console.warn("Failed to parse result param", e);
        return null;
      }
    }
  }, [params?.result]);

  const score = parsedResult?.result?.score ?? null;
  const correct = parsedResult?.result?.correct_count ?? 0;
  const incorrect = parsedResult?.result?.incorrect_count ?? 0;
  const totalQuestions = correct + incorrect;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
    >
      <ThemedView style={styles.container}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <IconSymbol
            size={20}
            color="#fff"
            name="arrow.left"
            style={styles.icon}
          />
        </Pressable>

        {parsedResult ? (
          <ThemedView style={styles.card}>
            <View style={styles.headerRow}>
              <Image
                source={
                  user?.avatar_url
                    ? { uri: user.avatar_url }
                    : require("@/assets/images/react-logo.png")
                }
                style={styles.avatar}
              />
              <View style={{ marginLeft: 12 }}>
                <ThemedText style={styles.nameText}>
                  {user?.full_name || user?.name || user?.username || "Player"}
                </ThemedText>
                <ThemedText style={styles.subText}>{user?.email}</ThemedText>
              </View>
            </View>

            <ThemedView style={styles.resultBlock}>
              <ThemedText style={styles.scoreText}>
                Final Score: {score ?? "-"}
              </ThemedText>
              <ThemedText style={styles.infoText}>
                Total Questions: {totalQuestions}
              </ThemedText>
            </ThemedView>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.actionButton}
                onPress={() => router.back()}
              >
                <ThemedText style={styles.actionText}>Back</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: "#4CAF50" }]}
                onPress={() => {
                  router.push(`/photo-quiz` as any);
                }}
              >
                <ThemedText style={[styles.actionText, { color: "#fff" }]}>
                  New Quiz
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        ) : (
          <ThemedView>
            <ThemedText style={{ color: "#fff" }}>
              No result data available.
            </ThemedText>
          </ThemedView>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    minHeight: 800,
  },

  backButton: {
    position: "absolute",
    top: 12,
    left: 12,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 999,
    zIndex: 10,
  },

  icon: {
    width: 20,
    height: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: 12,
    padding: 20,
    gap: 40,
  },

  headerRow: {
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: "50%",
  },

  nameText: {
    fontSize: 24,
    fontWeight: "bold",
  },

  subText: {
    fontSize: 14,
    color: "#888",
  },

  resultBlock: {
    backgroundColor: "rgba(255, 255, 255, 0.02)",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    width: "100%",
  },

  scoreText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4CAF50",
    paddingBottom: 8,
  },

  infoText: {
    fontSize: 18,
    color: "#2196F3",
    marginTop: 8,
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  actionButton: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },

  actionText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
