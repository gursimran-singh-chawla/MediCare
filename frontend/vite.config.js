import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_PROXY || 'http://localhost:4000';

  return {
    plugins: [react()],
    server: {
      port: Number(env.VITE_PORT) || 5174,
      strictPort: true,
      proxy: {
        '/api': backendUrl,
        '/uploads': backendUrl
      }
    }
  };
});
