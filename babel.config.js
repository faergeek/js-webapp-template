module.exports = function babelConfig(api) {
  const dev = api.env('development');
  const node = api.caller(caller => caller.target === 'node');
  const supportsStaticESM = api.caller(caller => caller.supportsStaticESM);

  return {
    presets: [
      [
        '@babel/env',
        {
          browserslistEnv: node ? 'node' : api.env(),
          bugfixes: true,
          corejs: '3.8',
          shippedProposals: true,
          useBuiltIns: 'entry',
        },
      ],
      ['@babel/react', { development: dev, useSpread: true }],
    ],
    plugins: [
      ['@babel/transform-runtime', { useESModules: supportsStaticESM }],
    ],
  };
};
