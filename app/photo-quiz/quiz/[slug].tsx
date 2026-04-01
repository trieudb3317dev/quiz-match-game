import { getGameTypeByKey, getQuestionById, getQuestionsByQuizId } from "@/api";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth } from "@/hooks/use-auth";
import useSoloWebsocket from "@/hooks/use-solo-websocket";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";

type Params = { slug?: string };

export default function PhotoQuizOptionSlug() {
  const params = useLocalSearchParams<Params>();
  const slug = params?.slug;
  const router = useRouter();
  const [path, setPath] = React.useState<string[]>([]);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(
    null,
  );
  const [questions, setQuestions] = React.useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState<
    number | null
  >(null);
  const [currentQuestion, setCurrentQuestion] = React.useState<any>(null);
  const [gameTypeId, setGameTypeId] = React.useState<number>(0);
  const [timeLine, setTimeLine] = React.useState<number>(0);
  const [timeStarted, setTimeStarted] = React.useState<string>("");
  const [progressPercent, setProgressPercent] = React.useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const full = window.location.href;
      const path = window.location.pathname;
      setPath(path.split("/"));
    }
  }, []);

  // parse slug synchronously into parts (e.g. 'hard-quiz-1')
  const slugParts = slug ? String(slug).split("-") : [];
  const resourceId = slugParts.length
    ? String(slugParts[slugParts.length - 1])
    : "";
  const resourceType =
    slugParts.length > 1 ? String(slugParts[slugParts.length - 2]) : "quiz";
  const gameTypeKey = path.length > 1 ? path[1].replace("-", "_") : "";

  useEffect(() => {
    const fetchGameType = async () => {
      if (gameTypeKey) {
        const gameTypeData = await getGameTypeByKey(gameTypeKey);
        setGameTypeId(gameTypeData?.id || 0);
      }
    };
    fetchGameType();
  }, [gameTypeKey]);

  useEffect(() => {
    const fetchQuestionById = async (id: number) => {
      try {
        const questionData = await getQuestionById(id);
        // You can set the current question here if needed
        setTimeLine(questionData?.time_line || 0);
        setTimeStarted(questionData?.time_started || "");
      } catch (error) {
        console.error("Error fetching question by ID:", error);
      }
    };
    fetchQuestionById(currentQuestion?.id); // Example: fetch question with ID 1 on mount
  }, [currentQuestion?.id]);

  // Progress bar can use timeLine and timeStarted to show remaining time for the question
  // Use epoch milliseconds (UTC) for accurate elapsed/duration math
  // Helper: parse server ISO timestamp robustly as UTC (trim microseconds to ms, append 'Z' if missing)
  const parseUtcIsoToMs = (iso?: string | null) => {
    if (!iso) return NaN;
    let s = String(iso);
    // Trim microseconds/more-than-ms digits to milliseconds (e.g. .511048 -> .511)
    s = s.replace(/\.(\d{3})\d+/, ".$1");
    // If there's no timezone (no 'Z' and no offset like +00:00 or -07:00), treat as UTC by appending 'Z'
    if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(s)) {
      // Only append Z when string looks like YYYY-MM-DDTHH:MM:SS or with fractional seconds
      if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(s)) {
        s = s + "Z";
      }
    }
    const t = Date.parse(s);
    return isNaN(t) ? NaN : t;
  };

  const nowMs = Date.now();
  const startedMs = parseUtcIsoToMs(timeStarted);

  const remainingTime =
    !isNaN(startedMs) && nowMs - startedMs < timeLine * 1000
      ? timeLine * 1000 - (nowMs - startedMs)
      : 0;
  // update progressPercent based on timeLine and timeStarted
  React.useEffect(() => {
    setProgressPercent(0);
    if (!timeLine || !timeStarted) return;
    let mounted = true;
    const start = parseUtcIsoToMs(timeStarted);
    const duration = timeLine * 1000;

    const tick = () => {
      if (!mounted) return;
      const now = Date.now();
      const elapsed = Math.max(0, now - start);
      const pct = Math.min(1, elapsed / duration);
      const pct100 = Math.round(pct * 100 * 100) / 100; // keep two decimals
      setProgressPercent(pct100);
      // if finished, ensure percent is 100
      if (elapsed >= duration) {
        setProgressPercent(100);
      }
    };

    tick();
    const id = setInterval(tick, 200);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [timeLine, timeStarted, currentQuestion?.id]);

  const expoExtra =
    (Constants as any).expoConfig?.extra ||
    (Constants as any).manifest?.extra ||
    {};

  const { user } = useAuth();

  // Connect websocket to listen for quiz updates (e.g., new questions, answer results) and update the UI accordingly
  const wsPath = `${expoExtra?.NEXT_PUBLIC_WS_BASE_URL || ""}${expoExtra?.NEXT_PUBLIC_WS_PREFIX || "/ws"}/solo-session/gameId/${gameTypeId}/resource-type/${resourceType}/resource-id/${Number(resourceId)}`;

  const {
    connected,
    lastMessage,
    connect,
    disconnect,
    joinSession,
    selectAnswer,
    requestGameResult,
    endSession,
  } = useSoloWebsocket({
    path: wsPath,
    autoConnect: false,
  });

  if (!slug) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  useEffect(() => {
    try {
      const fetchQuizData = async () => {
        const quizId = slug.split("-").pop(); // Assuming slug format is "difficulty-quiz-quizId"
        if (quizId) {
          const questions = await getQuestionsByQuizId(quizId);
          setQuestions(questions.data);
          setCurrentQuestionIndex(0); // Start with the first question
          setCurrentQuestion(questions.data[0]);
        }
      };
      fetchQuizData();
    } catch (error) {
      console.error("Error fetching quiz data:", error);
    }
  }, [slug]);

  // connect websocket when user and slug are ready
  useEffect(() => {
    if (user && slug && gameTypeId !== 0) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [user, slug, connect, disconnect]);

  // auto-join session once connected (only once)
  const joinedRef = React.useRef(false);
  useEffect(() => {
    if (connected && !joinedRef.current) {
      // request the server to create/join a solo session for this user/quiz
      joinSession();
      joinedRef.current = true;
    }
  }, [connected, joinSession]);

  // react to messages from server: navigate to scoreboard on game_result
  useEffect(() => {
    if (!lastMessage) return;
    try {
      if (lastMessage.type === "game_result") {
        const payload = lastMessage;
        console.log("Received game_result, navigating to scoreboard", payload);
        // encode result as query param (stringified)
        const encoded = encodeURIComponent(JSON.stringify(payload));
        router.push(`/photo-quiz/scoreboard?result=${encoded}` as any);
      }
    } catch (e) {
      console.error("failed handling lastMessage", e);
    }
  }, [lastMessage, router]);

  const handleOptionPress = (option: string) => {
    setSelectedOption(option);
    console.log("Selected option:", option);
    // notify server of selected answer
    try {
      // option is id string or number
      const id = Number(option);
      const rs = selectAnswer(id, 100 - progressPercent);
      console.log("selectAnswer response:", rs);
    } catch (e) {
      console.error("selectAnswer failed", e);
    }
  };

  const handleNextPress = () => {
    if (
      currentQuestionIndex !== null &&
      currentQuestionIndex < questions.length - 1
    ) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
      setSelectedOption(null); // Reset selected option for the next question
    } else {
      console.log("Quiz completed!");
      const results = requestGameResult();
      console.log("Requested game result:", results);
      router.push(
        `/photo-quiz/scoreboard?result=${encodeURIComponent(JSON.stringify(results))}` as any,
      );
      endSession();
      // You can navigate to a results screen or show a completion message here
    }
  };

  const handlePrePress = () => {
    if (currentQuestionIndex !== null && currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      setCurrentQuestion(questions[prevIndex]);
      setSelectedOption(null); // Reset selected option for the previous question
    } else {
      console.log("This is the first question!");
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
            {currentQuestionIndex !== null ? currentQuestionIndex + 1 : 0}
          </ThemedText>
          <ThemedText style={{ fontWeight: "bold", fontSize: 18 }}>
            / {questions ? questions.length : 0}
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
          <ThemedView style={styles.progressTrack}>
            <ThemedView
              style={[
                styles.progressFill,
                { width: `${100 - progressPercent}%` },
              ]}
            />
          </ThemedView>
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
              {currentQuestion?.question_text}
            </ThemedText>
            <Image
              source={require("@/assets/images/react-logo.png")}
              style={{ width: "100%", height: 200, borderRadius: 12 }}
            />
          </ThemedView>
          <ThemedView style={styles.optionsContainer}>
            {currentQuestion &&
              currentQuestion.answer.map((option: any) => (
                <Pressable
                  key={option.id}
                  style={styles.optionButton}
                  onPress={() => handleOptionPress(option.id)}
                >
                  <ThemedText style={styles.optionText}>
                    {option.answer_text}
                  </ThemedText>
                </Pressable>
              ))}
          </ThemedView>
          <ThemedView style={styles.gridWrapper}>
            <Pressable
              onPress={handlePrePress}
              style={{
                backgroundColor: selectedOption
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(255, 255, 255, 0.02)",
              }}
            >
              <IconSymbol
                size={20}
                color={selectedOption ? "#fff" : "rgba(255, 255, 255, 0.5)"}
                name="arrow.left"
              />
            </Pressable>
            <Pressable
              onPress={handleNextPress}
              style={{
                backgroundColor: selectedOption
                  ? "rgba(255, 255, 255, 0.06)"
                  : "rgba(255, 255, 255, 0.02)",
              }}
            >
              <IconSymbol
                size={20}
                color={selectedOption ? "#fff" : "rgba(255, 255, 255, 0.5)"}
                name="arrow.right"
              />
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
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 5,
    marginVertical: 12,
  },
  progressTrack: {
    width: "80%",
    height: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 5,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#7CFC7C",
    borderRadius: 5,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
