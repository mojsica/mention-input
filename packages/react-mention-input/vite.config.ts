import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@mojsica/mention-core': resolve(__dirname, '../mention-core/src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MojsicaReactMentionInput',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      // Bundle private @mojsica/mention-core into the published UI package
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        assetFileNames: 'styles.css',
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
