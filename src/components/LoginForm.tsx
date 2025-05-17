
import { useState } from "react";
import AccessRequestForm from "./AcessRequestForm";
import LoginCard from "../auth/LoginCard";
import PasswordResetDialog from "../auth/PasswordResetDialog";

const LoginForm = () => {
  const [isAccessRequestOpen, setIsAccessRequestOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [resetEmailInitial, setResetEmailInitial] = useState("");

  const handleForgotPassword = (email: string) => {
    setResetEmailInitial(email);
    setIsResetPasswordOpen(true);
  };

  return (
    <div className="login-container">
      <LoginCard 
        onForgotPassword={handleForgotPassword} 
        onRequestAccess={() => setIsAccessRequestOpen(true)} 
      />
      
      <AccessRequestForm 
        isOpen={isAccessRequestOpen} 
        onClose={() => setIsAccessRequestOpen(false)} 
      />

      <PasswordResetDialog 
        isOpen={isResetPasswordOpen} 
        onOpenChange={setIsResetPasswordOpen}
        email={resetEmailInitial}
      />
    </div>
  );
};

export default LoginForm;