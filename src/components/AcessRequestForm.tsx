// Modal de cadastro de usuário

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
} from "@mui/material";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { validatePassword } from "@/utils/passwordValidation";
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
  const [passwordError, setPasswordError] = useState("");
  const [role, setRole] = useState("");

  const checkPasswordValidity = () => {
    const result = validatePassword(password, confirmPassword);
    setPasswordError(result.error);
    return result.valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkPasswordValidity()) return;

    setIsSubmitting(true);
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const db = getDatabase(app);
      // Salve todos os campos, inclusive telefone e função
      await set(ref(db, "users/" + user.uid), { name, email, phone, role });

      showToast("Cadastro realizado com sucesso. Você já pode fazer login.", "success");
      onClose();
      resetForm();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone(""); // Resetar campo de telefone
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
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
            inputProps={{ maxLength: 20 }} // Limite de 20 caracteres
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
            inputProps={{ maxLength: 20 }} // Limite de 20 caracteres
          />
        </Box>
        <Typography variant="body2" color="textSecondary">
          {getRoleLabel(role)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Cadastrando..." : "Criar conta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessRequestForm;