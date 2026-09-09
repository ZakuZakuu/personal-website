/** @type {import('prettier').Config} */
export default {
  plugins: ['prettier-plugin-astro'],
  overrides: [{ files: '*.astro', options: { parser: 'astro' } }],
  printWidth: 92,
  proseWrap: 'preserve',
  singleQuote: true,
  trailingComma: 'all',
};
