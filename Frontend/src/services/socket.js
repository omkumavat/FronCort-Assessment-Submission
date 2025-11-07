// FILE: frontend/src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

// Connect socket
export const connectSocket = () => {
  if (!socket) {
    socket = io('https://froncort-assessment-submission.onrender.com', {
      autoConnect: true,
      transports: ["websocket", "polling"], // fallback if websocket blocked
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("disconnect", (reason) =>
      console.log("⚠️ Socket disconnected:", reason)
    );
  }
  return socket;
};

export const getSocket = () => socket;

// Join document (send full user object)
export const joinDocument = (pageId, user) => {
  if (!socket) return;
  console.log("🟢 Joining document:", { pageId, user });
  socket.emit("join-document", { pageId, user });
};

// Emit document changes
export const sendDocumentUpdate = (pageId, update, user) => {
  if (!socket) return;
  socket.emit("document-update", { pageId, update, user });
};

// Leave document
export const leaveDocument = (pageId, user) => {
  if (!socket) return;
  socket.emit("user-left", { pageId, user });
};
