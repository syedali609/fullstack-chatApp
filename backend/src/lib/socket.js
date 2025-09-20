import express from "express";
import { Server } from "socket.io";
import http from "http";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: ["http://localhost:5173"], credentials: true },
});

// Store: { userId: socketId }
const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ Client connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("joinGroup", (groupId) => {
    console.log(`Socket ${socket.id} joining group: ${groupId}`);
    socket.join(groupId); // ✅ JOIN group room
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, server, app };
