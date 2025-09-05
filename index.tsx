import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import './assets/logo.ts';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// To prevent error #300, we check if a root has already been created.
// We attach the root to the element itself to make it globally accessible
// across potential script re-executions.
if (!(rootElement as any)._reactRoot) {
  (rootElement as any)._reactRoot = createRoot(rootElement);
}

const root = (rootElement as any)._reactRoot as Root;

root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);