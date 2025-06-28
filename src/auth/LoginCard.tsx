import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";

interface LoginCardProps {
  onForgotPassword: (email: string) => void;
  onRequestAccess: () => void;
  showToast: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

const LoginCard = ({ onForgotPassword, onRequestAccess, showToast }: LoginCardProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  function validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setEmailError("Formato de email inválido.");
      setIsLoading(false);
      return;
    }

    try {
      const success = await login(email, password);
      if (success) {
        showToast("Login realizado", "success");
        navigate("/patients");
      } else {
        setEmailError("Email ou senha incorretos.");
        setPasswordError("Email ou senha incorretos.");
      }
    } catch (error: any) {
      showToast("Erro ao fazer login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <div className="card login-card">
        <div className="card-header" style={{ textAlign: 'center' }}>
          <Logo className="mx-auto mb-2" />
          <h2 className="card-title">Bem-vindo ao SafeCare</h2>
          <p className="card-description">
            Entre com suas credenciais para acessar o sistema
          </p>
          <form onSubmit={handleUserLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              error={!!emailError}
              helperText={emailError}
            />
            <TextField
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              error={!!passwordError}
              helperText={passwordError}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button
                onClick={() => onForgotPassword(email)}
                size="small"
                sx={{ textTransform: "none" }}
              >
                Esqueceu sua senha?
              </Button>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{ marginTop: 2 }}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <Typography
              variant="body2"
              align="center"
              sx={{ marginTop: 2, color: "text.secondary" }}
            >
              Não tem uma conta?{" "}
              <Button
                onClick={onRequestAccess}
                size="small"
                sx={{ textTransform: "none", color: "primary.main" }}
              >
                Cadastre-se agora
              </Button>
            </Typography>
          </form>
        </div>
      </div>
    </Box>
  );
};

export default LoginCard;