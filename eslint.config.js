import { base, node, react, typescript } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['build/']),
  base,
  typescript,
  {
    files: ['*.js'],
    extends: [node],
  },
  {
    files: ['*.cjs'],
    extends: [node],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['src/**/*'],
    extends: [react],
    settings: {
      linkComponents: [
        { name: 'Button', linkAttribute: ['href', 'to'] },
        { name: 'Link', linkAttribute: 'to' },
      ],
    },
  },
]);
