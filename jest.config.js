const esModules = ['lodash-es'].join('|');

module.exports = {
  testPathIgnorePatterns: ['/node_modules/', 'dist'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  modulePathIgnorePatterns: ['/node_modules/', 'dist'],
  transformIgnorePatterns: [`/node_modules/.pnpm/(?!${esModules})`],
  testEnvironment: 'jsdom',
  transform: {
    "\\.(j|t)s$": "@sucrase/jest-plugin",
    "\\.vue$": "vue-jest",
    "\\.(css|scss|png|jpg|svg|ttf|woff|woff2)$": "jest-transform-stub"
  },
  roots: ['<rootDir>'],
  setupFiles: ['./jest.setup.js'],
};
