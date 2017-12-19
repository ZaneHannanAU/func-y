// Just get everything I guess.

module.exports = Object.defineProperties(require('./template'), {
  template: {enumerable: true, value: require('./template')},
  named: {enumerable: true, get: require.bind(require, './named')},
  writer: {enumerable: true, get: require.bind(require, './writer')},
  namedTemplate: {enumerable: true, get: require.bind(require, './named')},
  writeFile: {enumerable: true, get: require.bind(require, './write-file')}
})
