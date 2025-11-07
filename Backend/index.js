// FILE: backend/server.js
import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './Database/db.js';
import Pages from './Router/Pages.js';
import Project from './Router/Project.js';
import Page from './Models/Page.js';

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/server/pages', Pages);
app.use('/server/projects', Project);
app.get('/', (req, res) => res.send('API is running...'));

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://project-collab-editor.vercel.app',
    methods: ['GET', 'POST'],
  },
});

const userSessions = new Map(); // socket.id -> { user info + pageId }

io.on('connection', (socket) => {
  console.log('🟢 New connection:', socket.id);

  // --- JOIN DOCUMENT ---
  socket.on('join-document', ({ pageId, user }) => {
    if (!user || !user.name) {
      console.warn('⚠️ join-document called without user info');
      return;
    }

    socket.join(pageId);
    userSessions.set(socket.id, { ...user, pageId });
    console.log(`👤 ${user.name} joined page ${pageId}`);

    // Notify others
    socket.to(pageId).emit('user-joined', { user });
  });

  // --- DOCUMENT UPDATES ---
  // socket.on('document-update', async ({ pageId, update, user }) => {
  //   if (!pageId || !update) return;

  //   // Save to DB
  //   try {
  //     await Page.updateOne({ pageId }, { content: update });
  //   } catch (err) {
  //     console.error('DB update error:', err.message);
  //   }

  //   // Emit update to all other clients in the room
  //   socket.to(pageId).emit('document-update', { documentId: pageId, update, user });
  // });

  // --- LEAVE DOCUMENT ---
  socket.on('user-left', ({ pageId, user }) => {
    if (!pageId || !user) return;
    console.log(`👋 ${user.name} left page ${pageId}`);
    socket.to(pageId).emit('user-left', { user });
    userSessions.delete(socket.id);
    socket.leave(pageId);
  });

  // --- DISCONNECT ---
  socket.on('disconnect', () => {
    const userData = userSessions.get(socket.id);
    if (userData) {
      console.log(`🔴 ${userData.name} disconnected from page ${userData.pageId}`);
      socket.to(userData.pageId).emit('user-left', { user: userData });
      userSessions.delete(socket.id);
    }
  });
});

// Start server
const PORT = 4000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on ${process.env.CLIENT_URL}`)
);
