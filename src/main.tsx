import { createRoot } from "react-dom/client";
import App from "./app.tsx";
import "./index.css";
import { StatusBar, Style } from '@capacitor/status-bar';
import { App as CapacitorApp } from '@capacitor/app';
import { startKeepAlive } from './lib/keepAlive';
import { initCache } from './lib/offlineCache';

// Initialize offline cache
initCache().then(() => {
  console.log('Offline cache initialized');
}).catch(err => {
  console.error('Failed to initialize cache:', err);
});

// Start keep-alive service to prevent backend from sleeping
startKeepAlive();

// Configure status bar for mobile
if (window.Capacitor) {
  StatusBar.setStyle({ style: Style.Dark });
  StatusBar.setBackgroundColor({ color: '#0a0e1a' });
  
  // Handle Android back button
  CapacitorApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      // On home page, minimize app instead of closing
      CapacitorApp.minimizeApp();
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
