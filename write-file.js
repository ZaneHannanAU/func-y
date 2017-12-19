const mkdirp = require('util').promisify(require('mkdirp'))
const {dirname} = require('path')
const fs = require('fs')
const writer = require('./writer')


const writeFile = (path, arr, {
  overwrite = false,
  flags = overwrite ? 'w' : 'wx',
  encoding = 'utf8',
  env = { path, encoding },
  ...opts
} = {}) => mkdirp(dirname(path)).then(() => {
  const writable = fs.createWriteStream(path, { flags, encoding, ...opts })
  return writer(writable, encoding, arr, env)
})
module.exports = writeFile