// Utilitário para testar a configuração do Firebase
import { auth, database, app } from '@/services/firebaseConfig';

export const testFirebaseConnection = () => {
  console.log('Testando configuração do Firebase...');
  
  // Verificar se o auth está inicializado
  console.log('Auth domain:', auth.config.authDomain);
  console.log('Project ID:', app.options.projectId);
  console.log('Auth estado atual:', auth.currentUser);
  
  // Verificar se o database está configurado
  console.log('Database URL:', database.app.options.databaseURL);
  
  return {
    authInitialized: !!auth,
    databaseInitialized: !!database,
    projectId: app.options.projectId,
    authDomain: auth.config.authDomain
  };
};

// Função para verificar se estamos usando emuladores (desenvolvimento)
export const checkEmulators = () => {
  const isAuthEmulator = auth.config.authDomain?.includes('localhost');
  console.log('Usando emulador de Auth:', isAuthEmulator);
  return isAuthEmulator;
};
