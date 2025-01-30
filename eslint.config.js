import { base, node, react, typescript } from '@faergeek/eslint-config';
import globals from 'globals';

export default [
  { ignores: ['build/'] },
  ...base,
  ...node.map(config => ({
    ...config,
    files: ['*.js'],
  })),
  ...node.map(config => ({
    ...config,
    files: ['*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  })),
  ...react.map(config => ({
    ...config,
    files: ['src/**/*'],
    settings: {
      linkComponents: [
        { name: 'Button', linkAttribute: ['href', 'to'] },
        { name: 'Link', linkAttribute: 'to' },
      ],
    },
  })),
  ...typescript,
];
