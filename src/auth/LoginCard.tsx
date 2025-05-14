import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { useToast } from "../components/hooks/use-toast";
import Logo from "../components/Logo";

interface LoginCardProps {
  onForgotPassword: (email: string) => void;
  onRequestAccess: () => void;
}

const LoginCard = ({ onForgotPassword, onRequestAccess }: LoginCardProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Aqui seria a integração com Firebase
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login realizado",
        description: "Você foi autenticado com sucesso!",
      });
      
      // Simula autenticação e redirecionamento
      localStorage.setItem("isLoggedIn", "true");
      window.location.href = "/dashboard";
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="space-y-2 text-center">
        <Logo className="mx-auto mb-2" />
        <CardTitle className="text-2xl font-bold">Bem-vindo ao SafeCare</CardTitle>
        <CardDescription>
          Entre com suas credenciais para acessar o sistema
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleUserLogin}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <button 
                type="button"
                onClick={() => onForgotPassword(email)} 
                className="text-xs text-safecare-600 hover:underline"
              >
                Esqueceu sua senha?
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button className="w-full bg-safecare-600 hover:bg-safecare-700" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          <div className="mt-4 text-center text-sm">
            Não tem uma conta?{" "}
            <button
              type="button"
              onClick={onRequestAccess}
              className="text-safecare-600 hover:underline"
            >
              Cadastre-se agora
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginCard;