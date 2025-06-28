
// Página de autenticação de usuários do sistema SafeCare-Home

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";

interface IndexProps {
  showToast: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

const Index = ({ showToast }: IndexProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/patients", { replace: true });
    } else if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, isLoading, navigate]);
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <LoginForm showToast={showToast} />;
};

export default Index;