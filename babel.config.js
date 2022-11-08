module.exports = api => ({
  presets: [
    [
      '@babel/env',
      {
        bugfixes: true,
        shippedProposals: true,
      },
    ],
    [
      '@babel/react',
      {
        development: api.env('development'),
        runtime: 'automatic',
      },
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
