const { Stream, Transform } = require('stream')
const isReadableStream = obj => (obj instanceof Stream)
  && 'function' === typeof obj._read
  && 'object' === typeof obj._readableState
  ;
const isWritableStream = obj => (obj instanceof Stream)
  && 'function' === typeof obj._write
  && 'object' === typeof obj._writableState
  ;

const escHTML = {
  re: /[<>'"\0]/g, // problem characters are caught here. Yeah, null is an issue in random places.
  sub(tx) { return String.raw`&#${tx.charCodeAt(0)};` },
  transform(chk, enc, cb) {
    return cb(null, (!Buffer.isBuffer(chk) ? str : String(str)).replace(escHTML.re, escHTML.sub))
  }
}

const writeFromFile = (file, opts) => Promise.resolve(file).then(fn => {
  const { createReadStream: crs } = require('fs')
  const { join } = require('path')

  if ('string' === typeof opts) opts = { encoding: String(opts) }
  else if ('undefined' !== typeof opts && 'object' !== typeof opts && !Array.isArray(opts))
    throw new TypeError('write.file: opts must be string, object or undefined type.')
  switch (typeof fn) {
    case 'string': return crs(fn, opts)
    case 'number': return crs(null, { fd: fn, ...opts })
    case 'object': if (Array.isArray(fn)) return crs(join(...fn), opts)
    default: throw new TypeError(`write.file: unsupported first argument type "${typeof fn}", what.`)
  }
})

const writeFromNet = (opts, cb) => new Promise(r => {
  const {URL} = require('url')
  const options = 'string' === typeof opts ? new URL(opts) : opts
  const req = require(options.protocol.slice(0, -1)).request(options, res => {
    if ('function' === typeof cb) r(cb({req, res}))
    else r(res)
  })
})

const writeNext = (res, rej, write, e, d) => (
  !e ? (d || d === 0 ? write(d).then(() => res(), rej) : res()) : rej(e)
  // error and data checks
)

const writeAll = (write, current, ...chunks) => current && chunks.length
  ? Promise.resolve(current).then(write).then(() => writeAll(write, ...chunks))
  : Promise.resolve(current).then(write).then(() => null)
  ;

const writeText = async (writeable, write, str, enc) => !isReadableStream(str) ? write(
  ('string' === typeof str ? str : String(await str)).replace(escHTML.re, escHTML.sub),
  enc
) : new Promise(r => str.on('end', r).pipe(new Transform(escHTML)).pipe(writable, { end: false }))

const writer = (writable, env = {}, data, enc = 'utf8') => new Promise(async (res, rej) => {
  // console.log('have data: %s', require('util').inspect(data, {colors: true}))
  if (!data && data !== 0 && data !== false) return res(true)
  switch (typeof (data)) {
    case 'string':
    case 'number':
    case 'boolean':
      return Promise.resolve(writable.write(String(data), enc))
        .then(v => v ? res() : writable.once('drain', res), rej)

    case 'object':
      if (data !== await data) writer(writable, env, await data, enc)
        .then(res, rej)

      if (Buffer.isBuffer(data)) return Promise.resolve(writable.write(data))
        .then(v => v ? res() : writable.once('drain', res), rej)

      if ('function' === typeof data.valueOf && data.valueOf() !== data) writer(writable, env, data.valueOf(), enc)
        .then(res, rej)

      if (Array.isArray(data)) {
        for (const blk of data) await writer(writable, env, blk, enc)
        return r()
      }

      if (isReadableStream(data)) return data
        .on('end', () => setImmediate(res))
        .on('error', rej)
        .pipe(writable, { end: false })

      console.error(data)
      return rej({error: `Unknown object data`, data})

    case 'function':
      // console.log('function call')
      let write = writer.bind(null, writable, env)
      write.error = rej
      write.destroy = rej

      write.file = writeFromFile
      write.net = writeFromNet
      write.request = writeFromNet

      write.next = writeNext.bind(null, res, rej, write)
      write.all = writeAll.bind(null, write)
      write.text = writeText.bind(null, writable, write)

      // console.log({data, env})
      return Promise.resolve(data(env, write, write.next)).then(v => {
        if (v || v === 0) return write(v).then(res)
        return res()
      })

    default:
      return rej({ error: `Unknown written data type: ${typeof data}`, data })
  }
})

/**
 * @function writeIter
 * @param {Stream.writable} writable - to call writable.write, writable.on(e) and the like
 * @param {string} enc - encoding to write
 * @param {*[]} arr - array of data to write or call (buffer, string, function, ...)
 * @param {*} env - environment to use.
 */
const writeIter = async (writable, enc, arr, env, autoclose = true) => {
  if (!isWritableStream(writable)) throw new TypeError('writable is not a writable stream')
  try {
    for (const data of await arr) {
      // console.log('got data: %s', util.inspect(data, {colors: true}))
      await writer(writable, env, data, enc)
    }
    return await new Promise(r => {
      if (autoclose && !writable.isTTY) writable.end(r); else r();
      writable.once('drain', r);
      setTimeout(r, 1e4)
    })
  } catch (e) {
    writable.destroy(e)
    console.error(e)
    throw e
  }
}
module.exports = writeIter
module.exports.writeIter = writeIter
module.exports.writer = writer

module.exports.escHTML = escHTML

module.exports.isReadableStream = isReadableStream
module.exports.isWritableStream = isWritableStream

module.exports.writeFromFile = writeFromFile
module.exports.writeFromNet = writeFromNet
module.exports.writeNext = writeNext
module.exports.writeAll = writeAll
module.exports.writeText = writeText