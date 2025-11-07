import { io } from "socket.io-client";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io("https://froncort-assessment-submission.onrender.com", {
      autoConnect: true,
      transports: ["websocket"], // force WebSocket
    });

    socket.on("connect", () => console.log("✅ Socket connected:", socket.id));
    socket.on("disconnect", (reason) =>
      console.log("⚠️ Socket disconnected:", reason)
    );
  }
  return socket;
};

export const getSocket = () => socket;

export const joinDocument = (pageId, userId) => {
  if (!socket) return;
  socket.emit("join-document", { pageId, userId });
};

export const sendDocumentUpdate = (pageId, update, user) => {
  if (!socket) return;
  socket.emit("document-update", { pageId, update, user });
};

export const sendCursorUpdate = (pageId, cursor) => {
  if (!socket) return;
  socket.emit("cursor-update", { pageId, cursor });
};
