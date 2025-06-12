import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { validatePassword } from "@/utils/validations";
import { isValidEmail, isEmailDeliverable } from "@/utils/validations";
import { app } from "@/services/firebaseConfig";
import RoleSelector from "@/auth/RoleSelector";

interface AccessRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

const AccessRequestForm = ({ isOpen, onClose, showToast }: AccessRequestFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [role, setRole] = useState("");

  const checkPasswordValidity = () => {
    const result = validatePassword(password, confirmPassword);
    setPasswordError(result.error);
    return result.valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPasswordError("");

    if (!isValidEmail(email)) {
      showToast("E-mail inválido. Por favor, insira um e-mail válido.", "error");
      setIsSubmitting(false);
      return;
    }

    if (!checkPasswordValidity()) {
      setIsSubmitting(false);
      return;
    }

    // Verifica se o email existe de verdade
    const emailOk = await isEmailDeliverable(email);
    if (!emailOk) {
      setIsSubmitting(false);
      setEmailError("Email inválido ou inexistente.");
      return;
    }

    try {
      const auth = getAuth(app);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const db = getDatabase(app);
      await set(ref(db, "users/" + user.uid), { name, email, phone, role });

      showToast("Cadastro realizado com sucesso. Você já pode fazer login.", "success");
      onClose();
      resetForm();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocorreu um erro desconhecido.";
      showToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone(""); 
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setEmailError("");
    setRole("");
  };

  function getRoleLabel(role: string) {
    switch (role) {
      case "doctor":
        return "Médico";
      case "nurse":
        return "Enfermeiro";
      case "caregiver":
        return "Cuidador";
      case "other":
        return "Outro";
      default:
        return role;
    }
  }

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar uma conta</DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Preencha o formulário abaixo para se cadastrar no sistema SafeCare Home.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            error={!!emailError}
            helperText={emailError}
            required
          />
          <TextField
            fullWidth
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            margin="normal"
            required
          />
          <RoleSelector role={role} onRoleChange={setRole} />
          <TextField
            fullWidth
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            inputProps={{ maxLength: 20 }} 
          />
          <TextField
            fullWidth
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            error={!!passwordError}
            helperText={passwordError}
            required
            inputProps={{ maxLength: 20 }} 
          />
        </Box>
        <Typography variant="body2" color="textSecondary">
          {getRoleLabel(role)}
        </Typography>
      </DialogContent>

      <FormControlLabel
        control={
          <Checkbox
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            color="primary"
          />
        }
        label="Ao criar uma conta, você concorda que seus dados serão armazenados e utilizados para gerenciar seus dados e interações com o sistema SafeCare."
        sx={{ mx: 2, mb: 2, alignItems: "flex-start" }}
      />

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          style={{ 
            opacity: isSubmitting || !acceptedTerms ? 0.8 : 1
          }}
          disabled={isSubmitting || !acceptedTerms}
        >
          {isSubmitting ? "Cadastrando..." : "Criar conta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessRequestForm;