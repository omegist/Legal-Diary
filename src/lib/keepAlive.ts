// Keep backend alive by pinging it every 10 minutes
const API_URL = 'https://legal-diary-backend.onrender.com/api';

let keepAliveInterval: NodeJS.Timeout | null = null;

export function startKeepAlive() {
  // Don't start if already running
  if (keepAliveInterval) return;
  
  // Ping backend every 10 minutes (600000ms)
  keepAliveInterval = setInterval(async () => {
    try {
      await fetch(`${API_URL}/health`, { method: 'GET' });
      console.log('Keep-alive ping sent');
    } catch (error) {
      console.error('Keep-alive ping failed:', error);
    }
  }, 600000); // 10 minutes
  
  console.log('Keep-alive service started');
}

export function stopKeepAlive() {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('Keep-alive service stopped');
  }
}
