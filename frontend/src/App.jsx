import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth.jsx";
import { ThemeProvider } from "./lib/theme.jsx";
import Landing from "./pages/Landing.jsx";
import ChatApp from "./pages/ChatApp.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Pricing from "./pages/Pricing.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <LoadingScreen />;
  }
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* Alternador de modo claro/escuro: fixo, disponivel em qualquer
            pagina do app (landing, login, chat, admin...). */}
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <ChatApp />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}
