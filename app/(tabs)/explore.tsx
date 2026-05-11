import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { getSoloSessions, getSoloSessionScores } from "@/api/game";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useEffect, useState } from "react";

export default function TabTwoScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [query, setQuery] = useState("");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [scoresPage, setScoresPage] = useState(1);
  const [scoresLoading, setScoresLoading] = useState(false);

  const loadSessions = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getSoloSessions({ page: p, pageSize, query });
      setSessions(res.data || res.sessions || []);
    } catch (e) {
      console.error("Load sessions failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(1);
  }, [query]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadSessions(next);
  };

  const openSessionScores = async (session: any) => {
    setSelectedSession(session);
    setScoresPage(1);
    setScores([]);
    setScoresLoading(true);
    try {
      const res = await getSoloSessionScores(session.id, { page: 1 });
      setScores(res.data || res.scores || []);
    } catch (e) {
      console.error("Load scores failed", e);
    } finally {
      setScoresLoading(false);
    }
  };

  const loadMoreScores = async () => {
    if (!selectedSession) return;
    const next = scoresPage + 1;
    setScoresPage(next);
    setScoresLoading(true);
    try {
      const res = await getSoloSessionScores(selectedSession.id, {
        page: next,
      });
      const more = res.data || res.scores || [];
      setScores((s) => [...s, ...more]);
    } catch (e) {
      console.error("Load more scores failed", e);
    } finally {
      setScoresLoading(false);
    }
  };
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
    >
      <ThemedView style={{ paddingHorizontal: 24, width: "100%", gap: 8 }}>
        <ThemedText type="defaultSemiBold">Solo sessions & scores</ThemedText>
        <TextInput
          placeholder="Search sessions..."
          value={query}
          onChangeText={setQuery}
          style={{
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 8,
            marginTop: 8,
          }}
        />

        {loading ? (
          <ActivityIndicator />
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(i: any) => String(i.id)}
            renderItem={({ item }) => (
              <Pressable
                style={{
                  padding: 12,
                  backgroundColor: "#111",
                  marginVertical: 6,
                  borderRadius: 8,
                }}
                onPress={() => openSessionScores(item)}
              >
                <ThemedText style={{ color: "#fff" }}>
                  {item.title || `Session ${item.id}`}
                </ThemedText>
                <ThemedText type="defaultSemiBold" style={{ color: "#ccc" }}>
                  {item.created_at}
                </ThemedText>
              </Pressable>
            )}
            ListFooterComponent={() => (
              <Pressable
                onPress={loadMore}
                style={{ padding: 12, alignItems: "center" }}
              >
                <ThemedText>Load more sessions</ThemedText>
              </Pressable>
            )}
          />
        )}
      </ThemedView>
      {/* Scores modal */}
      <Modal visible={!!selectedSession} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText type="title">
              {selectedSession?.title || `Session ${selectedSession?.id}`}
            </ThemedText>
            {scoresLoading ? (
              <ActivityIndicator />
            ) : (
              <FlatList
                data={scores}
                keyExtractor={(i: any) => String(i.id)}
                style={{ width: "100%" }}
                renderItem={({ item, index }) => (
                  <View style={styles.scoreRow}>
                    <ThemedText>
                      {index + 1}. {item.player_name || item.username}
                    </ThemedText>
                    <ThemedText type="defaultSemiBold">{item.score}</ThemedText>
                  </View>
                )}
                ListFooterComponent={() => (
                  <Pressable onPress={loadMoreScores} style={{ marginTop: 8 }}>
                    <ThemedText>Load more scores</ThemedText>
                  </Pressable>
                )}
              />
            )}
            <Pressable
              onPress={() => setSelectedSession(null)}
              style={[styles.saveButton, { marginTop: 12 }]}
            >
              <ThemedText style={styles.saveText}>Close</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#121217",
    padding: 16,
    borderRadius: 12,
  },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  saveButton: {
    backgroundColor: "#007AFF",
    color: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    fontSize: 16,
    color: "#fff",
  },
});
