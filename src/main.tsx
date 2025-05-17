import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';

// Importe os providers
import { ToastProvider } from './components/ui/toast';
import { Dialog } from '@radix-ui/react-dialog'; // Radix não exporta DialogProvider, mas o ToastProvider já resolve o portal

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

createRoot(rootElement).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);