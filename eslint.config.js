import { base, react, typescript } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['build/']),
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
]);
