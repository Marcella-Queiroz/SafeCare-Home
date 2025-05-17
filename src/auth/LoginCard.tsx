
import { useState } from "react";
import { useToast } from "../components/hooks/use-toast";
import Logo from "../components/Logo";
//import "../styles.css";

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
      window.location.href = "/patients";
    }, 1500);
  };

  return (
    <div className="card login-card">
      <div className="card-header" style={{ textAlign: 'center' }}>
        <Logo className="mx-auto mb-2" />
        <h2 className="card-title">Bem-vindo ao SafeCare</h2>
        <p className="card-description">
          Entre com suas credenciais para acessar o sistema
        </p>
      </div>
      
      <form onSubmit={handleUserLogin}>
        <div style={{ margin: '1.5rem 0' }}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="password">Senha</label>
              <button 
                type="button"
                onClick={() => onForgotPassword(email)} 
                style={{ fontSize: '0.75rem', color: 'var(--primary-color)', background: 'none', border: 'none', padding: 0 }}
              >
                Esqueceu sua senha?
              </button>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="card-footer" style={{ flexDirection: 'column' }}>
          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
          <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem' }}>
            Não tem uma conta?{" "}
            <button
              type="button"
              onClick={onRequestAccess}
              style={{ color: 'var(--primary-color)', background: 'none', border: 'none', padding: 0 }}
            >
              Cadastre-se agora
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginCard;