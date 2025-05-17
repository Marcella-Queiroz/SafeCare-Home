import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/LoginForm";

const Index = () => {
  const navigate = useNavigate();
  
  // Verificar se o usuário está logado (simulado)
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return <LoginForm />;
};

export default Index;