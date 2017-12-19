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

const writer = (writable, env = {}, data, enc = 'utf8') => new Promise(async (res, rej) => {
  // console.log('have data: %s', require('util').inspect(data, {colors: true}))
  if (!data && data !== 0) return res(true)
  switch (typeof (data)) {
    case 'string':
    case 'number':
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

    case 'function':
      // console.log('function call')
      let write = writer.bind(null, writable, env)
      write.error = rej
      write.destroy = rej

      let next = (e, d) => (
        !e ? (d || d === 0 ? write(d).then(res, rej) : res()) : rej(e), // error and data checks
        null // return null after all of it. Just in case.
      )
      write.next = next

      let all = (current, ...chunks) => current && chunks.length
        ? write(current).then(() => all(...chunks))
        : write(current)
        ;
      write.all = all

      let text = async (str, enc) => !isReadableStream(str) ? write(
        ('string' === typeof str ? str : String(await str)).replace(escHTML.re, escHTML.sub),
        enc
      ) : new Promise(r => str.on('end', r).pipe(new Transform(escHTML)).pipe(writable, { end: false }))


      write.text = text
      // console.log({data, env})
      return Promise.resolve(data(env, write, next)).then(v => {
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
    return new Promise(r => {
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
