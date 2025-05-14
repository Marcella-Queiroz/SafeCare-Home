
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-safecare-50 to-white p-4">
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