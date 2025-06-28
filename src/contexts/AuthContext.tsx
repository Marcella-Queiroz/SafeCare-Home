// Contexto de autenticação responsável pelo gerenciamento do estado global do usuário logado

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
import { getDatabase, ref, get, set } from 'firebase/database';

interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: string
  ) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  updateUserData: (updates: Partial<User>) => void;
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
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUserData = async (firebaseUser: any): Promise<User> => {
    try {
      const db = getDatabase();
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      const snapshot = await get(userRef);
      
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return {
          uid: firebaseUser.uid,
          name: userData.name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          email: firebaseUser.email || '',
          role: userData.role || 'Usuário',
        };
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
    }
    
    return {
      uid: firebaseUser.uid,
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
      email: firebaseUser.email || '',
      role: 'Usuário',
    };
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = result.user;

      const userData = await fetchUserData(firebaseUser);
      setUser(userData);
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Erro ao logar no Firebase:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
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
        name: name,
        email: firebaseUser.email || '',
        role: role,
      };

      const db = getDatabase();
      const userRef = ref(db, `users/${firebaseUser.uid}`);
      await set(userRef, {
        name: name,
        email: firebaseUser.email,
        role: role,
        createdAt: new Date().toISOString()
      });

      setUser(userData);
      setIsAuthenticated(true);

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

  const updateUserData = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    isLoading,
    login,
    logout,
    register,
    resetPassword,
    updateUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
