//Pagina de login

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
    // Não redireciona se ainda está carregando
    if (isLoading) return;
    
    // Evita redirecionamentos múltiplos
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate("/patients", { replace: true });
    } else if (!isAuthenticated) {
      hasRedirected.current = false;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Mostra carregamento enquanto verifica autenticação
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return <LoginForm showToast={showToast} />;
};

export default Index;