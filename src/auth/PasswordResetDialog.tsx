
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
import { Mail } from "lucide-react";
import { useToast } from "../components/hooks/use-toast";

interface PasswordResetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
}

const PasswordResetDialog = ({ isOpen, onOpenChange, email }: PasswordResetDialogProps) => {
  const [resetEmail, setResetEmail] = useState(email);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);
    
    // Simulação de envio de email para redefinição de senha
    setTimeout(() => {
      setIsResetting(false);
      onOpenChange(false);
      
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redefinir senha</DialogTitle>
          <DialogDescription>
            Enviaremos um link para redefinir sua senha no email informado.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleResetPassword}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reset-email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 opacity-50" />
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isResetting}>
              {isResetting ? "Enviando..." : "Enviar link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordResetDialog;