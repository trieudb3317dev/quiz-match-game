import { useAuth } from "@/hooks/use-auth";
import useSoloWebsocket from "@/hooks/use-solo-websocket";
import Constants from "expo-constants";
import React from "react";

export default function TestDemo() {
  const { loading } = useAuth();

  // Read env from Expo runtime config, then runtime-config.json, then process.env.
  const expoExtra =
    (Constants as any).expoConfig?.extra ||
    (Constants as any).manifest?.extra ||
    {};
  const baseFromExpo = expoExtra?.NEXT_PUBLIC_WS_BASE_URL || null;
  const prefixFromExpo = expoExtra?.NEXT_PUBLIC_WS_PREFIX || null;

  const baseFromEnv =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_WS_BASE_URL as string | undefined)
      : undefined;
  const prefixFromEnv =
    typeof process !== "undefined"
      ? (process.env.NEXT_PUBLIC_WS_PREFIX as string | undefined)
      : undefined;

  // allow manual override via ?ws= on the URL (useful for dev)
  const override =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("ws")
      : null;

  const wsBase = override || baseFromExpo || baseFromEnv || null;
  const wsPrefix = prefixFromExpo || prefixFromEnv || "/ws";

  // Build WS path safely
  let wsPath: string;
  if (wsBase) {
    const base = String(wsBase).replace(/\/$/, "");
    const prefix = String(wsPrefix).replace(/\/$/, "");
    wsPath = `${base}${prefix.startsWith("/") ? "" : "/"}${prefix}/test`;
  } else {
    // fallback to same-origin
    try {
      const { protocol, host } = window.location;
      const wsProtocol = protocol === "https:" ? "wss:" : "ws:";
      wsPath = `${wsProtocol}//${host}${wsPrefix}/test`;
    } catch (e) {
      wsPath = "ws://localhost:8000/ws/test";
    }
  }

  console.log("WebSocket path resolved:", {
    wsPath,
    source: wsBase ? "expo/env/override" : "same-origin",
    expoExtra,
  });

  const { connected, lastMessage, send, connect, disconnect, addListener } =
    useSoloWebsocket({ path: wsPath, autoConnect: false });

  const [messages, setMessages] = React.useState<any[]>([]);

  React.useEffect(() => {
    return addListener((msg) => setMessages((m) => [msg, ...m].slice(0, 50)));
  }, [addListener]);

  // connect after auth resolved so cookies (if any) are in place
  React.useEffect(() => {
    if (!loading) connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect, loading]);

  function handleSendPing() {
    send({ type: "ping", ts: Date.now() });
  }

  return (
    <div>
      <h1 style={{ color: "#fff" }}>Test Demo</h1>
      <p style={{ color: "#fff" }}>
        WebSocket connected: {connected ? "yes" : "no"}
      </p>
      <p style={{ color: "#fff" }}>WS URL: {wsPath}</p>
      <p style={{ color: "#fff" }}>
        Last message: {lastMessage ? JSON.stringify(lastMessage) : "-"}
      </p>
      <button onClick={handleSendPing}>Send ping</button>
      <h3 style={{ color: "#fff" }}>Message history</h3>
      <div style={{ maxHeight: 300, overflow: "auto", color: "#fff" }}>
        {messages.map((m, i) => (
          <pre key={i} style={{ color: "#fff" }}>
            {JSON.stringify(m)}
          </pre>
        ))}
      </div>
    </div>
  );
}
