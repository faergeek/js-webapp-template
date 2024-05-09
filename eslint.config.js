import { base, node, react, typescript } from '@faergeek/eslint-config';

export default [
  { ignores: ['/build'] },
  ...base,
  ...node.map(config => ({
    ...config,
    files: ['*'],
  })),
  ...react.map(config => ({
    ...config,
    files: ['src/**/*'],
    settings: {
      linkComponents: ['Button', { name: 'Link', linkAttribute: 'to' }],
    },
  })),
  ...typescript.map(config => ({
    ...config,
    files: ['**/*.ts?(x)'],
  })),
];
