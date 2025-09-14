import { base, react, typescript, vitest } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['workspace/*/dist']),
  {
    extends: [base, react, typescript],
    settings: {
      linkComponents: [
        { name: 'Button', linkAttribute: ['href', 'to'] },
        { name: 'Link', linkAttribute: 'to' },
      ],
    },
  },
  { files: ['*.js'], languageOptions: { globals: globals.nodeBuiltin } },
  { files: ['**/*.spec.*'], extends: [vitest] },
]);
