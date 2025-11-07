

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
  cors: {
    origin: "https://project-collab-editor.vercel.app", // <-- frontend URL
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // force WebSocket only
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
    console.log(`👤 updated page ${pageId}`);
    socket.to(pageId).emit("document-update", update);
  });

  // --- Handle leave explicitly ---
  socket.on("user-left", ({ pageId, user }) => {
    console.log(`👋 ${user.name} left page ${pageId}`);
    socket.to(pageId).emit("user-left", { user });
    userSessions.delete(socket.id);
  });

  socket.on("mention", (data) => {
    // Broadcast to all users except sender
    socket.broadcast.emit("mention", data)
  })

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
server.listen(4000, () => console.log('🚀 Server running on https://froncort-assessment-submission.onrender.com'));

