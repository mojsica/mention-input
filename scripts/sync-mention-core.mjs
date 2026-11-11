import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = resolve(root, 'packages/mention-core/src');
const destDir = resolve(root, 'projects/angular-mention-input/src/lib/core');

mkdirSync(destDir, { recursive: true });
for (const file of ['models.ts', 'helpers.ts', 'index.ts']) {
  copyFileSync(resolve(srcDir, file), resolve(destDir, file));
}
console.log('Synced mention-core → angular-mention-input/src/lib/core');
