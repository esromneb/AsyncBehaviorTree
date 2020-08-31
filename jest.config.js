// module.exports = {
//   testEnvironment: 'node',
//   testPathIgnorePatterns: [
//     '/node_modules/',
//   ],
//   preset: 'ts-jest',
// };



module.exports = {
  "transform": {
    ".(ts|tsx)": "ts-jest",
    "\\.xml$": "jest-raw-loader"
  },
  "testRegex": "(/test/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  "moduleFileExtensions": [
    "ts",
    "tsx",
    "js"
  ],
  "watchPlugins": [
      "jest-watch-typeahead/filename",
      "jest-watch-typeahead/testname"
    ]
};
