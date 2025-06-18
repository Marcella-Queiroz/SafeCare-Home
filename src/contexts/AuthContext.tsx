//Gerencia o login e o estado do usuário

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';

interface User {
  displayName: string;
  uid: string;
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
  register: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<boolean>;
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

  // Sincroniza com Firebase Auth
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          email: firebaseUser.email || '',
          role: 'Usuário', // Pode ser ajustado conforme necessário
        };
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('safecare-user', JSON.stringify(userData));
        localStorage.setItem('safecare-auth', 'true');
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('safecare-user');
        localStorage.removeItem('safecare-auth');
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      const userData: User = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
        email: firebaseUser.email || '',
        role: 'Usuário',
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('safecare-user', JSON.stringify(userData));
      localStorage.setItem('safecare-auth', 'true');
      return true;
    } catch (error) {
      console.error('Erro ao logar no Firebase:', error);
      return false;
    }
  };

  const logout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('safecare-user');
        localStorage.removeItem('safecare-auth');
      })
      .catch((error) => {
        console.error('Erro ao fazer logout:', error);
      });
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<boolean> => {
    try {
      const auth = getAuth();
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      const userData: User = {
        uid: firebaseUser.uid,
        id: firebaseUser.uid,
        name: name,
        email: firebaseUser.email || '',
        role: role,
      };

      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('safecare-user', JSON.stringify(userData));
      localStorage.setItem('safecare-auth', 'true');

      // Opcional: você pode salvar o userData em um banco de dados como Firestore

      return true;
    } catch (error) {
      console.error('Erro ao registrar no Firebase:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
