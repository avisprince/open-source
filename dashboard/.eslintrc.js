module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'relay'],
  ignorePatterns: ['codegen.yml', 'src/assets/reactstrap-modal.module.css'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:tailwindcss/recommended',
        'plugin:relay/recommended',
      ],
      env: {
        browser: true,
        jest: true,
      },
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': 'warn',
        'react/react-in-jsx-scope': 'off',
        'tailwindcss/classnames-order': [
          'error',
          { config: 'tailwind.config.ts' },
        ],
        'tailwindcss/enforces-negative-arbitrary-values': [
          'warn',
          { config: 'tailwind.config.ts' },
        ],
        'tailwindcss/enforces-shorthand': [
          'warn',
          { config: 'tailwind.config.ts' },
        ],
        'tailwindcss/no-arbitrary-value': 'off',
        'tailwindcss/no-custom-classname': 'off',
        'tailwindcss/no-contradicting-classname': [
          'error',
          { config: 'tailwind.config.ts' },
        ],
        'relay/generated-flow-types': 'off',
      },
    },
  ],
};
