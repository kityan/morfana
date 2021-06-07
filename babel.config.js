module.exports = {
  presets: [
    [
      '@foxford/babel-preset-react-app',
      { absoluteRuntime: false, mjs: true, flow: false, typescript: true, runtime: 'automatic' },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-object-rest-spread',
    'babel-plugin-ramda',
    'babel-plugin-jsx-control-statements',
    'babel-plugin-styled-components',
  ],
}
