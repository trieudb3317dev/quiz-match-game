import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSoloWebsocketOptions {
  path?: string;
  token?: string | null;
  autoConnect?: boolean;
  reconnect?: boolean;
  maxRetries?: number;
  retryInterval?: number; // base ms
}

export interface UseSoloWebsocketResult {
  soloSessionId: number | null;
  joinSession: (sessionId?: number) => boolean;
  leaveSession: (sessionId?: number) => boolean;
  backJoinSession: (sessionId?: number) => boolean;
  selectAnswer: (answerId: number, fast_percent?: number) => boolean;
  requestGameResult: () => boolean;
  endSession: () => boolean;
  connected: boolean;
  lastMessage: any | null;
  send: (payload: any) => boolean;
  sendRaw: (text: string) => boolean;
  addListener: (fn: (msg: any) => void) => () => void;
  removeListener: (fn: (msg: any) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

// Reconnecting WebSocket hook (TypeScript)
export default function useSoloWebsocket({
  path = "/ws/test",
  token = null,
  autoConnect = true,
  reconnect = true,
  maxRetries = 10,
  retryInterval = 1000,
}: UseSoloWebsocketOptions = {}): UseSoloWebsocketResult {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<(msg: any) => void>>(new Set());
  const retryRef = useRef<number>(0);
  const shouldReconnectRef = useRef<boolean>(reconnect);
  const pendingSendsRef = useRef<any[]>([]);

  const [connected, setConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [soloSessionId, setSoloSessionId] = useState<number | null>(null);

  const buildUrl = useCallback((): string | null => {
    if (!path) return null;
    try {
      if (path.startsWith("ws://") || path.startsWith("wss://")) return path;
      const { protocol, hostname, port } = window.location;
      const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
      const host = port ? `${hostname}:${port}` : hostname;
      let url = `${wsProtocol}//${host}${path}`;
      if (token) {
        const sep = url.includes("?") ? "&" : "?";
        url = `${url}${sep}token=${encodeURIComponent(token)}`;
      }
      return url;
    } catch (e) {
      return path;
    }
  }, [path, token]);

  const _handleMessage = useCallback((ev: MessageEvent) => {
    let payload: any = ev.data;
    try {
      payload = JSON.parse(ev.data);
    } catch (e) {
      // keep raw
    }
    setLastMessage(payload);
    // update soloSessionId when server sends joined event
    try {
      if (payload && payload.type === "joined") {
        const sid = payload.solo_session_id || payload.soloSessionId || null;
        if (sid) setSoloSessionId(Number(sid));
      }
      if (payload && payload.type === "left") {
        // clear if server confirmed leaving
        const sid = payload.solo_session_id || payload.soloSessionId || null;
        if (!sid) setSoloSessionId(null);
        else if (Number(sid) === soloSessionId) setSoloSessionId(null);
      }
    } catch (e) {}
    listenersRef.current.forEach((fn) => {
      try {
        fn(payload);
      } catch (err) {
        // swallow listener errors
        // eslint-disable-next-line no-console
        console.error("ws listener error", err);
      }
    });
  }, []);

  const connect = useCallback(() => {
    const url = buildUrl();
    if (!url) return;

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      retryRef.current = 0;
      setConnected(true);
      if (pendingSendsRef.current.length) {
        pendingSendsRef.current.forEach((m) => {
          try {
            ws.send(typeof m === "string" ? m : JSON.stringify(m));
          } catch (e) {}
        });
        pendingSendsRef.current = [];
      }
    };

    ws.onmessage = _handleMessage;

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      if (shouldReconnectRef.current && retryRef.current < maxRetries) {
        const wait = retryInterval * Math.pow(1.5, retryRef.current);
        retryRef.current += 1;
        setTimeout(() => {
          connect();
        }, wait);
      }
    };

    ws.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.warn("WebSocket error", err);
      // onerror will be followed by onclose
    };

    wsRef.current = ws;
  }, [buildUrl, _handleMessage, maxRetries, retryInterval]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const send = useCallback((payload: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      pendingSendsRef.current.push(payload);
      return false;
    }
    try {
      const out =
        typeof payload === "string" ? payload : JSON.stringify(payload);
      wsRef.current.send(out);
      return true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("ws send error", e);
      return false;
    }
  }, []);

  const sendRaw = useCallback(
    (text: string) => {
      return send(text);
    },
    [send],
  );

  const addListener = useCallback((fn: (msg: any) => void) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  const removeListener = useCallback((fn: (msg: any) => void) => {
    listenersRef.current.delete(fn);
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = reconnect;
    if (autoConnect) connect();
    return () => {
      shouldReconnectRef.current = false;
      try {
        if (wsRef.current) wsRef.current.close();
      } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildUrl]);

  return {
    connected,
    lastMessage,
    soloSessionId,
    send,
    sendRaw,
    addListener,
    removeListener,
    connect,
    disconnect,
    // convenience events for solo session flows
    // server expects snake_case action names for solo session
    joinSession: (sessionId?: number) => {
      try {
        return send({ action: "join_session", solo_session_id: sessionId });
      } catch (e) {
        return false;
      }
    },
    leaveSession: (sessionId?: number) => {
      try {
        return send({
          action: "leave_session",
          solo_session_id: sessionId || soloSessionId,
        });
      } catch (e) {
        return false;
      }
    },
    endSession: () => {
      try {
        return send({
          action: "end_session",
          solo_session_id: soloSessionId,
        });
      } catch (e) {
        return false;
      }
    },
    backJoinSession: (sessionId?: number) => {
      try {
        return send({
          action: "back_join_session",
          solo_session_id: sessionId || soloSessionId,
        });
      } catch (e) {
        return false;
      }
    },
    selectAnswer: (answerId: number, fast_percent?: number) => {
      try {
        return send({
          action: "select_answer",
          answer_id: answerId,
          fast_percent: fast_percent, // optional, only sent if provided
          solo_session_id: soloSessionId,
        });
      } catch (e) {
        return false;
      }
    },
    requestGameResult: () => {
      try {
        return send({ action: "game_result", solo_session_id: soloSessionId });
      } catch (e) {
        return false;
      }
    },
  };
}
