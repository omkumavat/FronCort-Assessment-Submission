# 🚀 Collab - Collaborative Documentation & Kanban Platform

A complete, production-ready React.js frontend for a collaborative workspace, combining Confluence-style documentation with Jira-style Kanban boards.

**Project URL**: [https://project-collab-editor.vercel.app](https://project-collab-editor.vercel.app)

---

## ✨ Features

* **📝 Rich Text Editor** - Tiptap-based collaborative editor with real-time sync
* **📋 Kanban Boards** - Drag-and-drop task management with customizable workflows
* **👥 Real-time Collaboration** - Live presence tracking and instant updates
* **🎨 Beautiful UI** - Modern design with purple gradient theme
* **💾 Auto-save** - Never lose your work with automatic saving
* **📱 Fully Responsive** - Works seamlessly on all devices
* **🔔 Smart Notifications** - Toast notifications for all important events
* **🔔 Mention User** - Toast notifications for the user which is mentioned in editor like @User-123 

---

## 🎯 Quick Start

### Prerequisites

* Node.js >= 18
* npm >= 9
* MongoDB (local or cloud instance)
* Optional: `nvm` for Node version management [install here](https://github.com/nvm/nvm#installing-and-updating)

---

### Clone & Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate into the project
cd <YOUR_PROJECT_NAME>
```

---

### Frontend

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Visit Frontend: [http://localhost:8080](http://localhost:8080)

---

### Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Start backend server
npm start
```

Visit Frontend: [http://localhost:4000](http://localhost:4000)

---

## 🏗️ Folder Structure

### Frontend

```
frontend/
├─ public/             # Static assets
├─ src/
│  ├─ components/      # Reusable components
│  ├─ pages/           # Page-level components
│  ├─ store/           # Zustand/Redux store
│  ├─ utils/           # Helper functions
│  ├─ hooks/           # Custom React hooks
│  ├─ styles/          # Tailwind and custom CSS
│  └─ main.tsx         # React app entry
├─ package.json
├─ tsconfig.json
└─ vite.config.ts
```

### Backend

```
backend/
├─ controllers/        # Express route controllers
├─ models/             # MongoDB models
├─ routes/             # Express routes
├─ socket/             # Socket.io setup & handlers
├─ config/             # DB and environment config
├─ index.js           # Main backend entry
├─ package.json
```

---

## 📝 Workflow & Collaboration

1. **Feature Development**

   * Create a new branch from `main`:

     ```bash
     git checkout -b feature/<feature-name>
     ```
   * Make changes and commit with descriptive messages:

     ```bash
     git add .
     git commit -m "Add drag-and-drop kanban feature"
     ```
   * Push to remote and open a pull request.

2. **Code Reviews**

   * Team members review PRs for quality, readability, and performance.
   * Ensure all features are tested locally before merging.

3. **Real-time Collaboration**

   * Tiptap editor supports live cursor and text sync for multiple users.
   * Kanban boards update instantly across all connected clients via Socket.io.

4. **Notifications & Feedback**

   * Toast notifications appear for mentions, task updates, and editor changes.

5. **Deployment**

   * Frontend: Vercel
   * Backend: Render

---

## 🛠️ Tech Stack

* **Frontend:** React.js, TypeScript, Vite, Tailwind CSS, shadcn-ui, Tiptap
* **Backend:** Node.js, Express.js, Socket.io, MongoDB (Mongoose)
* **Collaboration:** Real-time sync via WebSockets
* **Deployment:** Vercel (frontend) + any cloud backend service

---

## 📚 Full Documentation & Guides

1. **Detailed Project Structure**

* Frontend and backend folders organized with clear separation of concerns.
* Components, pages, store, hooks, and utilities are modular for easy maintenance.
* Backend controllers, models, routes, middlewares, and socket logic are organized by functionality.

2. **Component Usage Examples**

* Each reusable component in frontend/src/components has a usage example in its README or Storybook.
* Example: Button.jsx can be used as <Button variant="primary">Click Me</Button>.

3. **Store Management Guide**

* Uses Zustand (or Redux) for state management.
* Central store in frontend/src/store manages user, document, and board states.
* Actions and selectors follow modular structure for scalability.

4. **Socket.io Integration**

* Backend Socket.io server in backend/index.js
* Frontend Socket.io client setup in frontend/src/services/socket.js
* Handles real-time editor updates, board drag-and-drop, presence tracking, and notifications.

5. **Customization & Theme Guide**

* Tailwind CSS + shadcn-ui for design system.
* Theme colors and gradients can be modified in frontend/src/styles/tailwind.config.js.
* Components support props for size, color, and variant customization.
