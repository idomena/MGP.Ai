import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Nutrition from "./pages/Nutrition";
import Workout from "./pages/Workout";
import Assistant from "./pages/Assistant";
import AssistantChat from "./pages/AssistantChat";
import Rewards from "./pages/Rewards";
import Profile from "./pages/Profile";
import OCR from "./pages/OCR";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/nutrition" element={<Nutrition />} />
          <Route path="/workout/:id?" element={<Workout />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/assistant/chat" element={<AssistantChat />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ocr" element={<OCR />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;