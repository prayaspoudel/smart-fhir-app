module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@domain': './src/domain',
          '@data': './src/data',
          '@infrastructure': './src/infrastructure',
          '@presentation': './src/presentation',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};
