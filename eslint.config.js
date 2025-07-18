import { base, node, react, typescript } from '@faergeek/eslint-config';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['build/']),
  base,
  typescript,
  {
    files: ['*.js'],
    extends: [node],
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
