module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageProvider: 'babel',
  coverageReporters: ['lcov'],
  transform: {
    '^.+\\.(ts\\.*|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['^.+\\.(js)$'],
  projects: ['<rootDir>/jest.config.js'],
}
