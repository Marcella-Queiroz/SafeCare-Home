//Formulário de login
import React, { useState } from "react";
import LoginCard from "@/auth/LoginCard";
import AccessRequestForm from "./AcessRequestForm";
import PasswordResetDialog from "@/auth/PasswordResetDialog";

interface LoginFormProps {
  showToast: (message: string, severity?: "success" | "error" | "info" | "warning") => void;
}

const LoginForm = ({ showToast }: LoginFormProps) => {
  const [isAccessRequestOpen, setIsAccessRequestOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetEmailInitial, setResetEmailInitial] = useState("");

  const handleForgotPassword = (email: string) => {
    setResetEmailInitial(email);
    setIsResetPasswordOpen(true);
  };

  return (
    <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
      <LoginCard
        onForgotPassword={handleForgotPassword}
        onRequestAccess={() => setIsAccessRequestOpen(true)}
        showToast={showToast}
      />

      <AccessRequestForm
        isOpen={isAccessRequestOpen}
        onClose={() => setIsAccessRequestOpen(false)}
        showToast={showToast}
      />

      <PasswordResetDialog
        isOpen={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        email={resetEmailInitial}
        showToast={showToast}
      />
    </div>
  );
};

export default LoginForm;