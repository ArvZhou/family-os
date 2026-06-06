/** @type {import('lint-staged').Config} */
module.exports = {
  '*.{ts,tsx,js,jsx}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,md,yaml,yml}': ['prettier --write'],
  '*.{java,xml}': ['prettier --write'],
};
