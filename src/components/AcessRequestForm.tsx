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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { validatePassword, validateEmailFormat, isValidEmailWithDomain } from "@/utils/validations";
import { app, auth } from "@/services/firebaseConfig";
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
  const [role, setRole] = useState("");
  const [emailValidating, setEmailValidating] = useState(false);

  const checkPasswordValidity = () => {
    const result = validatePassword(password, confirmPassword);
    setPasswordError(result.error);
    return result.valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação de formato do e-mail
    const emailValidation = validateEmailFormat(email);
    if (!emailValidation.valid) {
      showToast(emailValidation.error || "E-mail inválido", "error");
      return;
    }

    // Validação de domínio do e-mail (assíncrona)
    setEmailValidating(true);
    const domainValidation = await isValidEmailWithDomain(email);
    setEmailValidating(false);
    
    if (!domainValidation.valid) {
      showToast(domainValidation.error || "Domínio de e-mail inválido", "error");
      return;
    }

    if (!checkPasswordValidity()) return;

    setIsSubmitting(true);
    try {
      console.log('Iniciando cadastro de usuário:', { email, role });
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      console.log('Usuário criado:', user.uid);
      
      const db = getDatabase(app);
      await set(ref(db, "users/" + user.uid), { 
        name, 
        email, 
        phone, 
        role,
        createdAt: new Date().toISOString()
      });
      console.log('Dados salvos no banco de dados');

      showToast("Cadastro realizado! Você já está logado no sistema.", "success");
      onClose();
      resetForm();
    } catch (error: any) {
      console.error('Erro detalhado no cadastro:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      let errorMessage = "Ocorreu um erro desconhecido.";
      
      // Tratar códigos de erro específicos do Firebase
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "Este e-mail já está sendo usado por outra conta.";
          break;
        case 'auth/invalid-email':
          errorMessage = "E-mail inválido.";
          break;
        case 'auth/weak-password':
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Erro de conexão. Verifique sua internet.";
          break;
        default:
          errorMessage = error.message || "Erro ao criar conta.";
      }
      
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
            opacity: isSubmitting || emailValidating || !acceptedTerms ? 0.8 : 1
          }}
          disabled={isSubmitting || emailValidating || !acceptedTerms}
        >
          {emailValidating ? "Validando e-mail..." : isSubmitting ? "Cadastrando..." : "Criar conta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccessRequestForm;