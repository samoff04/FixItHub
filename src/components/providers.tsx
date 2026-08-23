"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type Toast = { id: string; message: string; variant: "success" | "error" | "info" };
type ToastContextType = { push: (message: string, variant?: Toast["variant"]) => void };
const ToastContext = createContext<ToastContextType>({ push: () => {} });
export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: Toast["variant"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const icon = { success: CheckCircle2, error: XCircle, info: Info };

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => {
            const Icon = icon[t.variant];
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                className="glass flex items-center gap-2 rounded-xl px-4 py-3 shadow-glow min-w-[260px]"
              >
                <Icon
                  size={18}
                  className={t.variant === "success" ? "text-emerald-400" : t.variant === "error" ? "text-rose-400" : "text-accent"}
                />
                <span className="text-sm text-gray-200">{t.message}</span>
                <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))} className="ml-auto text-gray-500 hover:text-gray-300">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

type SocketContextType = { socket: Socket | null; connected: boolean };
const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });
export const useSocket = () => useContext(SocketContext);

function SocketProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const s = io({ path: "/api/socket" });
    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [status]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <SocketProvider>{children}</SocketProvider>
      </ToastProvider>
    </SessionProvider>
  );
}