import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../components/ui/dialog";
import { useToast } from "./hooks/use-toast";
import PasswordFields from "../auth/PasswordFields";
import RoleSelector from "../auth/RoleSelector";
import { validatePassword } from "../utils/passwordValidation";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "../services/firebaseConfig"; // já configurado
import { getDatabase, ref, set } from "firebase/database";

interface AccessRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessRequestForm = ({ isOpen, onClose }: AccessRequestFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [passwordError, setPasswordError] = useState("");

  const checkPasswordValidity = () => {
    const result = validatePassword(password, confirmPassword);
    setPasswordError(result.error);
    return result.valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkPasswordValidity()) {
      return;
    }
    
    setIsSubmitting(true);
    
    //Impletação do Firebase Auth
    const auth = getAuth(app);
  
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
      
        // Salvar dados extras no Realtime Database
        const user = userCredential.user;
        const db = getDatabase(app);
        set(ref(db, 'users/' + user.uid), {
          name,
          email,
          role
        });

        setIsSubmitting(false);
        toast({
          title: "Cadastro realizado",
          description: "Sua conta foi criada com sucesso. Você já pode fazer login.",
        });
        localStorage.setItem("userRegistered", "true");
        onClose();
        resetForm();
      })
      .catch((error) => {
        setIsSubmitting(false);
        toast({
          title: "Erro ao cadastrar",
          description: error.message,
        });
      });
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setRole("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Criar uma conta</DialogTitle>
          <DialogDescription>
            Preencha o formulário abaixo para se cadastrar no sistema SafeCare Home.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="col-span-4">
                Nome completo
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-4"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="col-span-4">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-4"
                required
              />
            </div>
            
            <PasswordFields 
              password={password}
              confirmPassword={confirmPassword}
              passwordError={passwordError}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
            />
            
            <RoleSelector 
              role={role} 
              onRoleChange={setRole} 
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-safecare-600 hover:bg-safecare-700" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Cadastrando..." : "Criar conta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AccessRequestForm;