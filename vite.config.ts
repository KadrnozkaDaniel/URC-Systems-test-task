import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    checker({
      eslint: {
        useFlatConfig: true,
        lintCommand: 'eslint src  --cache',
      },
      typescript: true,
    }),
  ],
  optimizeDeps: { esbuildOptions: { define: { global: 'globalThis' } } },
});
