import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { getToken } from "next-auth/jwt";
import { setIO } from "./src/lib/socket-server";
import { prisma } from "./src/lib/db";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    cors: { origin: process.env.NEXTAUTH_URL || "*", credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const token = await getToken({
        req: socket.request as any,
        secret: process.env.NEXTAUTH_SECRET,
      });
      if (!token?.sub) return next(new Error("Unauthorized"));
      (socket.data as any).userId = token.sub;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = (socket.data as any).userId as string;
    socket.join(`user:${userId}`);

    await prisma.user.update({ where: { id: userId }, data: { isOnline: true } }).catch(() => {});
    io.emit("presence:update", { userId, isOnline: true });

    socket.on("conversation:join", (conversationId: string) => socket.join(`conversation:${conversationId}`));
    socket.on("conversation:leave", (conversationId: string) => socket.leave(`conversation:${conversationId}`));

    socket.on("typing:start", ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:update", { userId, conversationId, isTyping: true });
    });
    socket.on("typing:stop", ({ conversationId }: { conversationId: string }) => {
      socket.to(`conversation:${conversationId}`).emit("typing:update", { userId, conversationId, isTyping: false });
    });

    socket.on("disconnect", async () => {
      const remaining = await io.in(`user:${userId}`).fetchSockets();
      if (remaining.length === 0) {
        await prisma.user.update({ where: { id: userId }, data: { isOnline: false, lastSeenAt: new Date() } }).catch(() => {});
        io.emit("presence:update", { userId, isOnline: false });
      }
    });
  });

  setIO(io);

  httpServer.listen(port, () => {
    console.log(`> FixitHub ready on http://localhost:${port}`);
  });
});