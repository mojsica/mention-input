import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [vue()],
  cacheDir: '/tmp/vite-mention-demo-vue',
  server: {
    port: 5174,
    host: '127.0.0.1',
  },
  resolve: {
    alias: {
      '@mojsica/vue-mention-input/styles.css': resolve(
        root,
        '../../packages/vue-mention-input/src/styles.css'
      ),
      '@mojsica/vue-mention-input': resolve(root, '../../packages/vue-mention-input/src/index.ts'),
      '@mojsica/mention-core': resolve(root, '../../packages/mention-core/src/index.ts'),
    },
  },
});
