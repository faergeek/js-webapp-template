import { base, node, react, typescript } from '@faergeek/eslint-config';

export default [
  { ignores: ['build/'] },
  ...base,
  ...node.map(config => ({
    ...config,
    files: ['*.js'],
  })),
  ...react.map(config => ({
    ...config,
    files: ['src/**/*'],
  })),
  {
    settings: {
      linkComponents: [
        { name: 'Button', linkAttribute: ['href', 'to'] },
        { name: 'Link', linkAttribute: 'to' },
      ],
    },
  },
  ...typescript,
];
