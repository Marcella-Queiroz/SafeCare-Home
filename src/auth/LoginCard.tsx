// Card de Login
import React, { useState } from "react";
import { Button, TextField, Typography, Box } from "@mui/material";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "@/services/firebaseConfig";
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

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setEmailError("");
    setPasswordError("");

    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Login realizado", "success");
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "/patients";
    } catch (error: any) {
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        setEmailError("Email ou senha incorretos.");
        setPasswordError("Email ou senha incorretos.");
      } else if (error.code === "auth/invalid-email") {
        setEmailError("Formato de email inválido.");
      } else {
        showToast(error.message, "error");
      }
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