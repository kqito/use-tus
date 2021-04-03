module.exports = {
  verbose: true,
  collectCoverage: true,
  coverageDirectory: './coverage/',
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest',
  },
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  globals: {
    'ts-jest': {
      babelConfig: false,
      tsconfig: './tsconfig.json',
    },
  },
};
