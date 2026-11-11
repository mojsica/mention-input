import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@mojsica/mention-core': resolve(__dirname, '../mention-core/src/index.ts'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MojsicaVueMentionInput',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        exports: 'named',
        assetFileNames: 'styles.css',
        globals: {
          vue: 'Vue',
        },
      },
    },
    cssCodeSplit: false,
    emptyOutDir: true,
  },
});
