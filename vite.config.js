
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow access from network
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: ['9ba4efcbf7a9.ngrok-free.app', 'localhost','127.0.0.1',],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
