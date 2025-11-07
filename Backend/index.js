// // FILE: backend/server.js
// import express from 'express';
// import { Server } from 'socket.io';
// import http from 'http';
// import cors from 'cors';

// const app = express();
// app.use(cors());
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: '*',
//     methods: ['GET', 'POST'],
//   },
// });

// // Map to track active users: socket.id -> { userId, documentId?, boardId? }
// const activeUsers = new Map();

// io.on('connection', (socket) => {
//   console.log('🟢 User connected:', socket.id);

//   // ---------------- DOCUMENTS ----------------
//   socket.on('join-document', ({ documentId, userId }) => {
//     if (!documentId || !userId) return;
//     socket.join(`doc:${documentId}`);
//     activeUsers.set(socket.id, { userId, documentId });
//     console.log(`📄 ${userId} joined document ${documentId}`);

//     // Notify others in the document about new user
//     socket.to(`doc:${documentId}`).emit('presence-update', {
//       type: 'join',
//       userId,
//       documentId,
//     });
//   });

//   socket.on('leave-document', ({ documentId, userId }) => {
//     if (!documentId) return;
//     socket.leave(`doc:${documentId}`);
//     activeUsers.delete(socket.id);
//     console.log(`🚪 ${userId} left document ${documentId}`);

//     socket.to(`doc:${documentId}`).emit('presence-update', {
//       type: 'leave',
//       userId,
//       documentId,
//     });
//   });

//   socket.on('document-update', ({ documentId, update, userId }) => {
//     if (!documentId || !update) return;
//     socket.to(`doc:${documentId}`).emit('document-update', {
//       documentId,
//       update,
//       userId,
//     });
//   });

//   // Request or send full document
//   socket.on('request-document', ({ documentId }) => {
//     socket.to(`doc:${documentId}`).emit('request-document', { documentId });
//   });

//   socket.on('send-document', ({ documentId, data }) => {
//     socket.to(`doc:${documentId}`).emit('send-document', { documentId, data });
//   });

//   // ---------------- BOARDS ----------------
//   socket.on('join-board', ({ boardId, userId }) => {
//     if (!boardId || !userId) return;
//     socket.join(`board:${boardId}`);
//     console.log(`🗂️ ${userId} joined board ${boardId}`);
//   });

//   socket.on('board-update', ({ boardId, update, userId }) => {
//     if (!boardId || !update) return;
//     socket.to(`board:${boardId}`).emit('board-update', { boardId, update, userId });
//   });

//   // ---------------- PRESENCE ----------------
//   socket.on('presence-update', (presence) => {
//     const room = presence.documentId
//       ? `doc:${presence.documentId}`
//       : presence.projectId
//       ? `project:${presence.projectId}`
//       : null;

//     if (room) {
//       socket.to(room).emit('presence-update', presence);
//     } else {
//       socket.broadcast.emit('presence-update', presence);
//     }
//   });

//   // ---------------- DISCONNECT ----------------
//   socket.on('disconnect', () => {
//     const userInfo = activeUsers.get(socket.id);
//     if (userInfo?.documentId) {
//       socket.to(`doc:${userInfo.documentId}`).emit('presence-update', {
//         type: 'leave',
//         userId: userInfo.userId,
//         documentId: userInfo.documentId,
//       });
//     }
//     activeUsers.delete(socket.id);
//     console.log('🔴 Client disconnected:', socket.id);
//   });
// });

// // Start server
// server.listen(4000, () =>
//   console.log('🚀 Socket.io server running on http://localhost:4000')
// );

import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import shortid from 'shortid';
import Pages from './Router/Pages.js'
import Page from './Models/Page.js';
import dotenv from 'dotenv';
import connectDB from './Database/db.js';
import Project from './Router/Project.js'
dotenv.config();

// ------------------- MongoDB -------------------
connectDB();

// ------------------- Express -------------------
const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use('/server/pages', Pages);
app.use('/server/projects',Project)

// ------------------- Socket.io -------------------
const userSessions = new Map(); // Track connected users by socket.id

io.on("connection", (socket) => {
  console.log("✅ New connection:", socket.id);

  // --- Handle join ---
  socket.on("join-document", ({ pageId, user }) => {
    if (!user || !user.name) {
      console.warn("⚠️ join-document called without user info");
      return;
    }

    socket.join(pageId);
    userSessions.set(socket.id, { ...user, pageId });
    console.log(`👤 ${user.name} joined page ${pageId}`);

    // Notify others in the same room
    socket.to(pageId).emit("user-joined", { user });
  });

  // --- Handle document updates ---
  socket.on("document-update", async ({ pageId, update }) => {
    await Page.updateOne({ pageId }, { content: update });
    socket.to(pageId).emit("document-update", update);
  });

  // --- Handle leave explicitly ---
  socket.on("user-left", ({ pageId, user }) => {
    console.log(`👋 ${user.name} left page ${pageId}`);
    socket.to(pageId).emit("user-left", { user });
    userSessions.delete(socket.id);
  });

  // --- Handle disconnect (tab closed, refresh, etc.) ---
  socket.on("disconnect", () => {
    const userData = userSessions.get(socket.id);
    if (userData) {
      console.log(`❌ ${userData.name} disconnected from page ${userData.pageId}`);
      socket.to(userData.pageId).emit("user-left", { user: userData });
      userSessions.delete(socket.id);
    }
  });
});


// ------------------- Start server -------------------
server.listen(4000, () => console.log('🚀 Server running on http://localhost:4000'));

