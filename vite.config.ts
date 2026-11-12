import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/trilha-web/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  /*
    O corretor ortográfico acha o próprio .wasm por new URL ao lado do módulo.
    Pré-empacotado pelo servidor de desenvolvimento, o módulo muda de pasta e o
    endereço passa a apontar para uma página de erro — a folha ficava sem
    sublinhado só no npm run dev, e a build funcionava.
  */
  optimizeDeps: {
    exclude: ['hunspell-wasm'],
  },
});
