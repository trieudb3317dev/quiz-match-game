import useRoomWebsocket, {
    UseRoomWebsocketResult,
} from "@/hooks/use_room_websocket";
import React, { createContext, useContext, useMemo, useState } from "react";

type RoomSocketContextValue = UseRoomWebsocketResult & {
  path: string;
  setPath: (p: string) => void;
};

const RoomSocketContext = createContext<RoomSocketContextValue | null>(null);

export function RoomSocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [path, setPath] = useState<string>("");

  // delegate to existing hook but drive it from provider state
  const ws = useRoomWebsocket({ path, autoConnect: !!path, reconnect: true });

  const value = useMemo(
    () => ({ ...(ws as any), path, setPath }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ws, path],
  );

  return (
    <RoomSocketContext.Provider value={value}>
      {children}
    </RoomSocketContext.Provider>
  );
}

export function useRoomSocket() {
  const ctx = useContext(RoomSocketContext);
  if (!ctx)
    throw new Error("useRoomSocket must be used within RoomSocketProvider");
  return ctx;
}

export default RoomSocketProvider;
