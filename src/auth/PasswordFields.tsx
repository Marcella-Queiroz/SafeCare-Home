
//import { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

interface PasswordFieldsProps {
  password: string;
  confirmPassword: string;
  passwordError: string;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

const PasswordFields = ({
  password,
  confirmPassword,
  passwordError,
  onPasswordChange,
  onConfirmPasswordChange
}: PasswordFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="password" className="col-span-4">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="col-span-4"
          required
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="confirmPassword" className="col-span-4">
          Confirmar senha
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          className="col-span-4"
          required
        />
        {passwordError && (
          <p className="col-span-4 text-sm text-red-500">{passwordError}</p>
        )}
      </div>
    </>
  );
};

export default PasswordFields;