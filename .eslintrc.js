module.exports = {   root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    // 'no-unused-vars': 'warn', // options: error, warn, off
    // 'eol-last': 'off',
    // 'semi': [2, "always"], // enforcing the use of semicolon
    // 'no-trailing-spaces': 'off',
    // 'no-multiple-empty-lines': 'warn'
    'no-console': ["error", { allow: ["warn", "error", "log"] }],
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)'
      ],
      env: {
        mocha: true
      }
    }
  ]
}