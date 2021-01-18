module.exports = function babelConfig(api) {
  const target = api.caller(caller => caller.target);

  return {
    presets: [
      [
        '@babel/env',
        {
          corejs: 3,
          targets: target === 'node' ? { node: 'current' } : undefined,
          useBuiltIns: 'usage',
        },
      ],
      [
        '@babel/react',
        { development: api.env('development'), useBuiltIns: true },
      ],
    ],
    plugins: [
      ['@babel/transform-runtime', { useESModules: true }],
      api.env('development') && target === 'web' && 'react-refresh/babel',
    ].filter(Boolean),
  };
};
