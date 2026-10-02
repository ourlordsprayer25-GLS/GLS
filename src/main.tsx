import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import { LanguageCurrencyProvider } from './context/LanguageCurrencyContext';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register the PWA service worker with automatic cache purging & immediate update execution
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <LanguageCurrencyProvider>
        <App />
      </LanguageCurrencyProvider>
    </HelmetProvider>
  </StrictMode>,
);

