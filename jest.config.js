const esModules = ['lodash-es'].join('|');

module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  testPathIgnorePatterns: ['/node_modules/', 'dist'],
  modulePathIgnorePatterns: ['/node_modules/', 'dist'],
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  transform: {
    "^.+\\.vue$": "vue-jest",
  },
  roots: ['<rootDir>'],
  setupFiles: ['./jest.setup.js'],
};
