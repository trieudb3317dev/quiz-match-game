import Constants from "expo-constants";

const BASE_URL =
  Constants.expoConfig?.extra?.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000";
const PREFIX = Constants.expoConfig?.extra?.NEXT_PUBLIC_API_PREFIX || "/api/v1";
const API_URL = `${BASE_URL}${PREFIX}`;

// Game-related API functions
import { authFetch } from "./request";

export async function getGameTypes() {
  try {
    const response = await authFetch(`${API_URL}/game-types`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch game types");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching game types:", error);
    throw error;
  }
}

export async function getGameTypeByKey(key: string) {
  try {
    const response = await authFetch(`${API_URL}/game-types/${key}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch game type");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching game type:", error);
    throw error;
  }
}

// Quiz-related API functions
export async function getQuizzes({
  page = 1,
  pageSize = 10,
  sortBy = "created_at",
  order = "desc",
  query = "",
  difficulty = null,
}: {
  page: number;
  pageSize: number;
  sortBy?: string;
  order?: "asc" | "desc";
  query?: string | null;
  difficulty?: string | null;
}) {
  try {
    const response = await authFetch(
      `${API_URL}/quizzes?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&order_by=${order}&query=${encodeURIComponent(
        query || "",
      )}&difficulty=${encodeURIComponent(difficulty || "")}`,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch quizzes");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    throw error;
  }
}

export async function getQuizById(id: string) {
  try {
    const response = await authFetch(`${API_URL}/quizzes/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch quiz");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching quiz:", error);
    throw error;
  }
}

// Question related API functions
export async function getQuestionsByQuizId(quizId: string) {
  try {
    const response = await authFetch(`${API_URL}/questions/quizzes/${quizId}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch questions");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching questions:", error);
    throw error;
  }
}

export async function getQuestionById(id: number) {
  try {
    const response = await authFetch(`${API_URL}/questions/${id}`, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch question");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
}

export async function getAnswerByQuestionId(questionId: string) {
  try {
    const response = await authFetch(
      `${API_URL}/questions/${questionId}/answers`,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch answer");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching answer:", error);
    throw error;
  }
}

export async function submitQuizAnswers(quizId: string, answers: any) {
  try {
    const response = await authFetch(`${API_URL}/quizzes/${quizId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answers }),
    });
    if (!response.ok) {
      throw new Error("Failed to submit quiz answers");
    }
    return await response.json();
  } catch (error) {
    console.error("Error submitting quiz answers:", error);
    throw error;
  }
}

// Solo selected quiz API functions
export async function createSoloSelectedQuiz(
  questionId: number,
  answerId: number,
  soloSessionId: number,
) {
  try {
    const response = await authFetch(
      `${API_URL}/game-selects/questions/${questionId}/answers/${answerId}/solo-sessions/${soloSessionId}  `,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questionId, answerId, soloSessionId }),
      },
    );
    if (!response.ok) {
      throw new Error("Failed to create solo selected quiz");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating solo selected quiz:", error);
    throw error;
  }
}

// Solo sessions listing (paginated, filterable)
export async function getSoloSessions({
  page = 1,
  pageSize = 10,
  query = "",
  sortBy = "created_at",
  order = "desc",
}: {
  page?: number;
  pageSize?: number;
  query?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}) {
  try {
    const response = await authFetch(
      `${API_URL}/sessions/all?page=${page}&page_size=${pageSize}&sort_by=${sortBy}&order_by=${order}&query=${encodeURIComponent(
        query || "",
      )}`,
      {
        method: "GET",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch solo sessions");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching solo sessions:", error);
    throw error;
  }
}

// Scores for a specific solo session (paginated)
export async function getSoloSessionScores(
  sessionId: number,
  { page = 1, pageSize = 20 }: { page?: number; pageSize?: number } = {},
) {
  try {
    const response = await authFetch(
      `${API_URL}/solo-sessions/${sessionId}/scores?page=${page}&page_size=${pageSize}`,
      { method: "GET" },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch solo session scores");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching solo session scores:", error);
    throw error;
  }
}
