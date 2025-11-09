import { Toaster as ShadToaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";

import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import Layout from "./components/Layout/Layout";
import Dashboard from "./pages/Dashboard";
import ProjectPage from "./pages/ProjectPage";
import EditorPage from "./pages/EditorPage";
// import KanbanPage from "./pages/KanbanPage";
import NotFound from "./pages/NotFound";
import ProjectsPage from "./pages/ProjectsPage";

import { initUser } from "./lib/auth";

const queryClient = new QueryClient();

// Initialize user once
initUser();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <TooltipProvider>

            {/* Routes */}
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="project/:id" element={<ProjectPage />} />
                   <Route path="projects" element={<ProjectsPage />} />
                  <Route path="editor/:pageId" element={<EditorPage />} />
                  {/* <Route path="board/:id" element={<KanbanPage />} /> */}
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<NotFound />} />
                
              </Routes>
            </BrowserRouter>
            <Toaster position="top-right" richColors />
          </TooltipProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
