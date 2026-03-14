import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Params = { slug?: string };

export default function MemoryMatchOptionSlug() {
  const params = useLocalSearchParams<Params>();
  const slug = params?.slug;
  const router = useRouter();
  const [selectedOption, setSelectedOption] = React.useState<string | null>(
    null,
  );

  if (!slug) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
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
            borderRadius: "50%",
            zIndex: 1,
          }}
          onPress={() => router.back()}
        >
          <IconSymbol
            size={20}
            color="#fff"
            name="arrow.left"
            style={styles.icon}
          />
        </Pressable>
        <ThemedView
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginVertical: 12,
            gap: 4,
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 1,
          }}
        >
          <ThemedText style={{ fontWeight: "bold", fontSize: 18 }}>
            1
          </ThemedText>
          <ThemedText style={{ fontWeight: "bold", fontSize: 18 }}>
            /10
          </ThemedText>
        </ThemedView>
        <ThemedView
          style={{
            width: "100%",
            height: "auto",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingVertical: "15%",
            gap: 30,
          }}
        >
          <ThemedView style={styles.progress} />

          <ThemedView style={styles.gridWrapper}>
            <ThemedView style={styles.gridContainer}>
              {Array.from({ length: 6 }).map((_, i) => (
                <ThemedView key={i} style={styles.matchCard}>
                  <ThemedText
                    style={{ color: "#fff", fontSize: 16, textAlign: "center" }}
                  >
                    Card {i + 1}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  icon: {
    width: 20,
    height: 20,
  },
  progress: {
    width: "80%",
    height: 10,
    backgroundColor: "lightgreen",
    borderRadius: 5,
    marginVertical: 12,
  },
  optionsContainer: {
    width: "90%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  optionButton: {
    width: "100%",
    backgroundColor: "rgba(230, 35, 230, 1)",
    padding: 12,
    marginVertical: 12,
    borderRadius: 8,
    // borderColor: "#fff",
    // borderWidth: 1,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "normal",
  },
  gridWrapper: {
    width: "90%",
    // backgroundColor: "rgba(255, 255, 255, 0.06)",
    padding: 12,
    borderRadius: 8,
    // borderColor: "#fff",
    // borderWidth: 1,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  matchCard: {
    width: "48%",
    height: 150,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 8,
    borderColor: "#fff",
    borderWidth: 1,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
});
