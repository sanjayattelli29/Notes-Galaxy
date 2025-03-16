
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./components/ThemeProvider";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Trash from "./pages/Trash";
import FileTrash from "./pages/FileTrash";
import Files from "./pages/Files";
import Starred from "./pages/Starred";
import NotFound from "./pages/NotFound";
import TaskManagement from "./pages/TaskManagement";
import Analysis from "./pages/Analysis";
import Profile from "./pages/Profile";

// Providers
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/trash" element={<Trash />} />
            <Route path="/file-trash" element={<FileTrash />} />
            <Route path="/files" element={<Files />} />
            <Route path="/starred" element={<Starred />} />
            <Route path="/tasks" element={<TaskManagement />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
