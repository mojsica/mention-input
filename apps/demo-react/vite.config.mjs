import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  cacheDir: '/tmp/vite-mention-demo-react',
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@mojsica/react-mention-input/styles.css': resolve(
        root,
        '../../packages/react-mention-input/src/styles.css'
      ),
      '@mojsica/react-mention-input': resolve(
        root,
        '../../packages/react-mention-input/src/index.ts'
      ),
      '@mojsica/mention-core': resolve(root, '../../packages/mention-core/src/index.ts'),
    },
  },
});
