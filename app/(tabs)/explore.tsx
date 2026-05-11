import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { getSoloSessions } from "@/api/game";
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
  const [totalPages, setTotalPages] = useState<number | null>(null);
  // single list from /sessions/all

  const loadSessions = async (p = 1) => {
    setLoading(true);
    try {
      const res = await getSoloSessions({ page: p, pageSize, query });
      // server returns { data: [...], total, page, page_size, total_pages }
      const data = res.data || [];
      if (p === 1) setSessions(data);
      else setSessions((prev) => [...prev, ...data]);

      // compute total pages if provided
      if (typeof res.total_pages === "number") setTotalPages(res.total_pages);
      else if (typeof res.total === "number")
        setTotalPages(
          Math.ceil(res.total / (res.page_size || pageSize)) || null,
        );
      else setTotalPages(null);
      setPage(p);
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
    if (totalPages && next > totalPages) return;
    loadSessions(next);
  };

  // we show the sessions list directly (each item includes user and score)
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
    >
      <ThemedView
        style={{
          paddingHorizontal: 24,
          width: "100%",
          gap: 8,
        }}
      >
        <ThemedText
          type="defaultSemiBold"
          style={{ fontSize: 24, textAlign: "center", paddingVertical: 16 }}
        >
          Solo sessions & scores
        </ThemedText>
        <TextInput
          placeholder="Search sessions..."
          value={query}
          onChangeText={setQuery}
          style={{
            backgroundColor: "#5050504f",
            color: "#fff",
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
            renderItem={({ item, index }) => (
              <View style={styles.scoreRow}>
                <ThemedText>
                  {index + 1}.{" "}
                  {item.user?.full_name ||
                    item.user?.username ||
                    `User ${item.user?.id}`}
                </ThemedText>
                <ThemedText type="defaultSemiBold">{item.score}</ThemedText>
              </View>
            )}
            ListFooterComponent={() =>
              totalPages === null || page < (totalPages || 0) ? (
                <Pressable
                  onPress={loadMore}
                  style={{ padding: 12, alignItems: "center" }}
                >
                  <ThemedText>Load more</ThemedText>
                </Pressable>
              ) : null
            }
          />
        )}
      </ThemedView>
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
    paddingHorizontal: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(117, 230, 25, 0.66)",
    borderRadius: 8,
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
