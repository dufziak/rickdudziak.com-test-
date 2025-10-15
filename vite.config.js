import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // FIX: Set the base path to relative (./) instead of absolute (/)
  // This ensures assets like CSS and JS are correctly found after deployment.
  base: './', 
  plugins: [react()],
  resolve: {
    alias: {
      // Set the '@' alias to point to the 'src' directory.
      // This resolves imports like '@/App' or '@/components/...'
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure the build output is compatible for hosting
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Simple file naming convention for compatibility
        manualChunks: undefined,
      },
    },
  },
});
