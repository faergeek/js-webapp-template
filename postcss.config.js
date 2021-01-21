module.exports = function postcssConfig(api) {
  return {
    plugins: [['postcss-preset-env', { autoprefixer: { env: api.mode } }]],
  };
};
