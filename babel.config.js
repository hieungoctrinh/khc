module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.ts', '.android.ts', '.ts', '.tsx', '.json'],
        alias: {
          '@redux': './src/redux',
          '@assets': './src/assets',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@navigation': './src/navigation',
          '@screens': './src/screens',
          '@themes': './src/themes',
          '@utils': './src/utils',
          '@i18n': './src/i18n'
        }
      }
    ]
  ]
}
