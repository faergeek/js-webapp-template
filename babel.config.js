module.exports = api => ({
  presets: [
    [
      '@babel/env',
      {
        browserslistEnv: api.caller(caller => caller.target === 'node')
          ? undefined
          : api.env(),
        bugfixes: true,
        corejs: '3.13',
        shippedProposals: true,
        useBuiltIns: 'entry',
      },
    ],
    [
      '@babel/react',
      {
        development: api.env('development'),
        importSource: 'preact',
        runtime: 'automatic',
      },
    ],
  ],
  plugins: [
    [
      '@babel/transform-runtime',
      { useESModules: api.caller(caller => caller.supportsStaticESM) },
    ],
  ],
});
