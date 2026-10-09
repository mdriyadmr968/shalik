import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web'
    }
  },
  define: {
    global: 'window',
    __DEV__: 'true'
  },
  server: {
    port: 3000,
    open: true
  }
});
