//Pagina de login

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";

interface IndexProps {
  showToast: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

const Index = ({ showToast }: IndexProps) => {
  const navigate = useNavigate();

  // Verificar se o usuário está logado
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  useEffect(() => {
    /*if (isLoggedIn) {
      navigate("/patients");
    }*/
  }, [isLoggedIn, navigate]);

  return <LoginForm showToast={showToast} />;
};

export default Index;