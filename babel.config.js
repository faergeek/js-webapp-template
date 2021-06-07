module.exports = api => ({
  presets: [
    [
      '@babel/env',
      {
        browserslistEnv: api.caller(caller => caller.target === 'node')
          ? undefined
          : api.env(),
        bugfixes: true,
        corejs: '3.14',
        shippedProposals: true,
        useBuiltIns: 'entry',
      },
    ],
    [
      '@babel/react',
      { development: api.env('development'), runtime: 'automatic' },
    ],
    '@babel/typescript',
  ],
  plugins: [
    [
      '@babel/transform-runtime',
      { useESModules: api.caller(caller => caller.supportsStaticESM) },
    ],
  ],
});
