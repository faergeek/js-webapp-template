module.exports = function babelConfig(api) {
  const dev = api.env('development');
  const node = api.caller(caller => caller.target === 'node');
  const supportsStaticESM = api.caller(caller => caller.supportsStaticESM);

  return {
    presets: [
      [
        '@babel/env',
        {
          corejs: '3.8',
          targets: node ? { node: 'current' } : undefined,
          useBuiltIns: 'entry',
        },
      ],
      ['@babel/react', { development: dev, useSpread: true }],
    ],
    plugins: [
      ['@babel/transform-runtime', { useESModules: supportsStaticESM }],
      dev && !node && 'react-refresh/babel',
    ].filter(Boolean),
  };
};
