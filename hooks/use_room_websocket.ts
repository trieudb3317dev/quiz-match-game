// Lightweight React hook to connect to the server's group-session WebSocket
// Designed for Expo / React Native + web usage. Builds on the server endpoints
// exposed in `/ws/group-session/.../room/{room_id}` and provides helpers
// (joinRoom, leaveRoom, joinSession, selectAnswer, requestGameResult)

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseRoomWebsocketOptions {
  path?: string; // path to websocket endpoint (can be absolute ws:// or relative /ws/...)
  token?: string | null;
  autoConnect?: boolean;
  reconnect?: boolean;
  maxRetries?: number;
  retryInterval?: number;
}

export interface UseRoomWebsocketResult {
  roomId: number | null;
  roomSessionId: number | null;
  joinRoom: (roomId?: number) => boolean;
  leaveRoom: (roomId?: number) => boolean;
  backJoinRoom: (roomId?: number) => boolean;
  joinSession: (sessionId?: number) => boolean;
  leaveSession: (sessionId?: number) => boolean;
  selectAnswer: (answerId: number, fastPercent?: number) => boolean;
  requestGameResult: (roomSessionId?: number) => boolean;
  connected: boolean;
  lastMessage: any | null;
  send: (payload: any) => boolean;
  sendRaw: (text: string) => boolean;
  addListener: (fn: (msg: any) => void) => () => void;
  removeListener: (fn: (msg: any) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

export default function useRoomWebsocket({
  path = "/ws/group-session/gameId/1/resource-type/quiz/resource-id/1/room/1",
  token = null,
  autoConnect = true,
  reconnect = true,
  maxRetries = 8,
  retryInterval = 1000,
}: UseRoomWebsocketOptions = {}): UseRoomWebsocketResult {
  const wsRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef<Set<(msg: any) => void>>(new Set());
  const retryRef = useRef<number>(0);
  const shouldReconnectRef = useRef<boolean>(reconnect);
  const pendingSendsRef = useRef<any[]>([]);

  const [connected, setConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<any | null>(null);
  const [roomId, setRoomId] = useState<number | null>(null);
  const [roomSessionId, setRoomSessionId] = useState<number | null>(null);

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
        url = `${url}${sep}access_token=${encodeURIComponent(token)}`;
      }
      return url;
    } catch (e) {
      return path;
    }
  }, [path, token]);

  const _handleMessage = useCallback(
    (ev: MessageEvent) => {
      let payload: any = ev.data;
      try {
        payload = JSON.parse(ev.data);
      } catch (e) {
        // keep raw
      }
      setLastMessage(payload);

      // update room/roomSession ids when server sends joined events
      try {
        if (payload && payload.type === "joined_room") {
          const rid = payload.room_id || payload.roomId || null;
          if (rid) setRoomId(Number(rid));
        }
        if (payload && payload.type === "joined_session") {
          const sid = payload.room_session_id || payload.roomSessionId || null;
          if (sid) setRoomSessionId(Number(sid));
        }
        if (payload && payload.type === "left_room") {
          const rid = payload.room_id || payload.roomId || null;
          if (!rid) setRoomId(null);
        }
        if (payload && payload.type === "left_session") {
          const sid = payload.room_session_id || payload.roomSessionId || null;
          if (!sid) setRoomSessionId(null);
          else if (Number(sid) === roomSessionId) setRoomSessionId(null);
        }
        if (payload && payload.type === "back_join_room") {
          const rid = payload.room_id || payload.roomId || null;
          if (rid) setRoomId(Number(rid));
        }
        if (payload && payload.type === "back_join_session") {
          const sid = payload.room_session_id || payload.roomSessionId || null;
          if (sid) setRoomSessionId(Number(sid));
        }
      } catch (e) {
        // ignore
      }

      listenersRef.current.forEach((fn: (msg: any) => void) => {
        try {
          fn(payload);
        } catch (err) {
          // swallow
        }
      });
    },
    [roomSessionId],
  );

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
        pendingSendsRef.current.forEach((m: any) => {
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
      // console.warn('WebSocket error', err)
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
      return false;
    }
  }, []);

  const sendRaw = useCallback((text: string) => send(text), [send]);

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

  // convenience helpers matching server actions (snake_case)
  const joinRoom = useCallback(
    (rid?: number) => {
      try {
        const payload: any = { action: "join_room" };
        if (typeof rid !== "undefined") payload.room_id = rid;
        const ok = send(payload);
        if (ok && typeof rid !== "undefined") setRoomId(Number(rid));
        return ok;
      } catch (e) {
        return false;
      }
    },
    [send],
  );

  const leaveRoom = useCallback(
    (rid?: number) => {
      try {
        const payload: any = { action: "leave_room" };
        if (typeof rid !== "undefined") payload.room_id = rid;
        const ok = send(payload);
        if (ok && (!rid || rid === roomId)) setRoomId(null);
        return ok;
      } catch (e) {
        return false;
      }
    },
    [send, roomId],
  );

  const backJoinRoom = useCallback(
    (rid?: number) => {
      try {
        const payload: any = { action: "back_join_room" };
        if (typeof rid !== "undefined") payload.room_id = rid;
        const ok = send(payload);
        if (ok && typeof rid !== "undefined") setRoomId(Number(rid));
        return ok;
      } catch (e) {
        return false;
      }
    },
    [send],
  );

  const joinSession = useCallback(
    (sessionId?: number) => {
      try {
        const payload: any = { action: "join_session" };
        if (typeof sessionId !== "undefined")
          payload.room_session_id = sessionId;
        const ok = send(payload);
        if (ok && typeof sessionId !== "undefined")
          setRoomSessionId(Number(sessionId));
        return ok;
      } catch (e) {
        return false;
      }
    },
    [send],
  );

  const leaveSession = useCallback(
    (sessionId?: number) => {
      try {
        const payload: any = { action: "leave_session" };
        if (typeof sessionId !== "undefined")
          payload.room_session_id = sessionId;
        const ok = send(payload);
        if (ok && (!sessionId || sessionId === roomSessionId))
          setRoomSessionId(null);
        return ok;
      } catch (e) {
        return false;
      }
    },
    [send, roomSessionId],
  );

  const selectAnswer = useCallback(
    (answerId: number, fastPercent?: number) => {
      try {
        const payload: any = { action: "select_answer", answer_id: answerId };
        if (roomSessionId) payload.room_session_id = roomSessionId;
        if (typeof fastPercent !== "undefined")
          payload.fast_percent = fastPercent;
        return send(payload);
      } catch (e) {
        return false;
      }
    },
    [send, roomSessionId],
  );

  const requestGameResult = useCallback(
    (sessionId?: number) => {
      try {
        const payload: any = { action: "game_result" };
        if (typeof sessionId !== "undefined")
          payload.room_session_id = sessionId;
        return send(payload);
      } catch (e) {
        return false;
      }
    },
    [send],
  );

  return {
    roomId,
    roomSessionId,
    joinRoom,
    leaveRoom,
    backJoinRoom,
    joinSession,
    leaveSession,
    selectAnswer,
    requestGameResult,
    connected,
    lastMessage,
    send,
    sendRaw,
    addListener,
    removeListener,
    connect,
    disconnect,
  };
}
