import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";
import NotificationManager from "./components/NotificationManager";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const Calendar = lazy(() => import("./pages/Calendar"));
const Nutrition = lazy(() => import("./pages/Nutrition"));
const Workout = lazy(() => import("./pages/Workout"));
const Assistant = lazy(() => import("./pages/Assistant"));
const AssistantChat = lazy(() => import("./pages/AssistantChat"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Profile = lazy(() => import("./pages/Profile"));
const OCR = lazy(() => import("./pages/OCR"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));

const queryClient = new QueryClient();

function NotificationManagerWrapper() {
  const { user } = useAuth();
  if (!user) return null;
  return <NotificationManager />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationManagerWrapper />
          <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
            <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
            <Route path="/workout/:id?" element={<ProtectedRoute><Workout /></ProtectedRoute>} />
            <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
            <Route path="/assistant/chat" element={<ProtectedRoute><AssistantChat /></ProtectedRoute>} />
            <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/ocr" element={<ProtectedRoute><OCR /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App