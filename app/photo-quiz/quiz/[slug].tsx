import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

type Params = { slug?: string };

export default function PhotoQuizOptionSlug() {
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
            gap: 20,
          }}
        >
          <ThemedView style={styles.progress}></ThemedView>
          <ThemedView
            style={{
              width: "90%",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              padding: 12,
              borderRadius: 8,
              borderColor: "#fff",
              borderWidth: 1,
            }}
          >
            <ThemedText style={{ fontSize: 18, fontWeight: "normal" }}>
              Identity the animal in the picture below:
            </ThemedText>
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={{ width: "100%", height: 200, borderRadius: 12 }}
            />
          </ThemedView>
          <ThemedView style={styles.optionsContainer}>
            <Pressable
              style={styles.optionButton}
              onPress={() => handleOptionPress("Tiger")}
            >
              <ThemedText style={styles.optionText}>Tiger</ThemedText>
            </Pressable>
            <Pressable
              style={styles.optionButton}
              onPress={() => handleOptionPress("Lion")}
            >
              <ThemedText style={styles.optionText}>Lion</ThemedText>
            </Pressable>
            <Pressable
              style={styles.optionButton}
              onPress={() => handleOptionPress("Elephant")}
            >
              <ThemedText style={styles.optionText}>Elephant</ThemedText>
            </Pressable>
            <Pressable
              style={styles.optionButton}
              onPress={() => handleOptionPress("Giraffe")}
            >
              <ThemedText style={styles.optionText}>Giraffe</ThemedText>
            </Pressable>
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
});
