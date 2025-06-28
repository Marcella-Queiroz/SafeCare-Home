// Modal para redefinir a senha do usuário
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Typography,
  Box
} from "@mui/material";
import { Mail, X as CloseIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface PasswordResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  showToast: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

const PasswordResetDialog = ({ isOpen, onOpenChange, email, showToast }: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState(email);
  const [isResetting, setIsResetting] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.trim()) {
      showToast("Por favor, informe um email válido.", "error");
      return;
    }

    setIsResetting(true);

    try {
      const success = await resetPassword(resetEmail);
      
      if (success) {
        onOpenChange(false);
        showToast("Email de recuperação enviado com sucesso! Verifique sua caixa de entrada.", "success");
      } else {
        showToast("Erro ao enviar email de recuperação. Verifique se o email está correto.", "error");
      }
    } catch (error) {
      console.error("Erro ao resetar senha:", error);
      showToast("Erro ao enviar email de recuperação. Tente novamente.", "error");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => onOpenChange(false)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2 }}>
        Redefinir senha
        <IconButton
          aria-label="close"
          onClick={() => onOpenChange(false)}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
          size="large"
        >
          <CloseIcon size={20} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Enviaremos um link para redefinir sua senha no email informado.
        </Typography>
        <Box component="form" onSubmit={handleResetPassword}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <Mail style={{ height: 16, width: 16, opacity: 0.5, marginRight: 8 }} />
              ),
            }}
            inputProps={{ maxLength: 50 }}
            sx={{ mb: 2 }}
          />
          <DialogActions sx={{ p: 0 }}>
            <Button onClick={() => onOpenChange(false)} color="inherit">
              Cancelar
            </Button>
            <Button type="submit" variant="contained" color="primary" disabled={isResetting}>
              {isResetting ? "Enviando..." : "Enviar link"}
            </Button>
          </DialogActions>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;