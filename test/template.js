const myTemplate = require('..') `You can put anything here now.

Raw HTML, anything.

Including a stream can be done too: ${(env, {file}) => file('file.txt')}.

Note that this is an effective shortcut for \`require('fs').createReadStream('file.txt')\`.

A stream in a promise from a different source is fine too: ${(env, {net}) => net('https://example.com')}.

Note that this is an effective shortcut for

\`\`\`javascript
(opts) => new Promise(r => {
  let {URL} = require('url')
  let o = 'string' === typeof opts ? new URL(opts) : opts
  require(o.protocol.slice(0,-1)).request(o, r)
})
\`\`\`

. See func-y/writer.js#writeFromNet (34:1) for more details.

Promises work too: ${() => new Promise(r => setTimeout(r, 3e3, 'Resolved after 3 seconds'))}.

There's other stuff: ${(env, write) => write.all(123, 'Mix and match', Infinity, String.fromCodePoint(0x2026), new Promise(r => setTimeout(r, 2e3, 'with random timing')), (env, write) => 'and subfunctions if memory is an issue?')}`

module.exports = myTemplate