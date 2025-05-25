import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  // Check localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('safecare-user');
    const storedAuth = localStorage.getItem('safecare-auth');
    
    if (storedUser && storedAuth === 'true') {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // Mock users for demo purposes
  const mockUsers = [
    {
      id: '1',
      name: 'Dr. João Silva',
      email: 'joao@safecare.com',
      password: '123456',
      role: 'Médico',
    },
    {
      id: '2',
      name: 'Enfermeira Ana',
      email: 'ana@safecare.com',
      password: '123456',
      role: 'Enfermeira',
    },
  ];

  const login = async (email: string, password: string): Promise<boolean> => {
    // Modificado para permitir qualquer credencial
    return new Promise((resolve) => {
      setTimeout(() => {
        // Primeiro tenta encontrar um usuário existente
        const foundUser = mockUsers.find(
          (user) => user.email === email && user.password === password
        );

        if (foundUser) {
          // Se encontrar um usuário existente, usa ele
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          setIsAuthenticated(true);
          localStorage.setItem('safecare-user', JSON.stringify(userWithoutPassword));
          localStorage.setItem('safecare-auth', 'true');
          resolve(true);
        } else {
          // Se não encontrar, cria um usuário fictício com os dados informados
          const newUser = {
            id: Math.random().toString(36).substr(2, 9),
            name: email.split('@')[0],  // Usa parte do email como nome
            email: email,
            role: 'Usuário'
          };
          
          setUser(newUser);
          setIsAuthenticated(true);
          localStorage.setItem('safecare-user', JSON.stringify(newUser));
          localStorage.setItem('safecare-auth', 'true');
          resolve(true);
        }
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('safecare-user');
    localStorage.removeItem('safecare-auth');
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    // In a real app, this would be an API call to register the user
    return new Promise((resolve) => {
      setTimeout(() => {
        const userExists = mockUsers.some((user) => user.email === email);
        if (userExists) {
          resolve(false);
        } else {
          resolve(true);
        }
      }, 1000);
    });
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // In a real app, this would be an API call to send reset password email
    return new Promise((resolve) => {
      setTimeout(() => {
        const userExists = mockUsers.some((user) => user.email === email);
        if (userExists) {
          resolve(true);
        } else {
          resolve(false);
        }
      }, 1000);
    });
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};