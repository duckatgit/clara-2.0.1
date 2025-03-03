import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'openai',
      'framer-motion',
      'react-hot-toast',
      'lucide-react',
      'clsx',
      'tailwind-merge',
    ],
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    minify: 'terser',
  },
});
