/** @type {import('lint-staged').Config} */
module.exports = {
  '*.{ts,tsx,js,jsx,json,md,yaml,yml}': ['prettier --write'],
};
