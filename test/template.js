const myTemplate = require('..') `You can put anything here now.

Raw HTML, anything.

Including a stream can be done too: ${() => require('fs').createReadStream('file.txt')}.

A stream in a promise from a different source is fine too: ${() => new Promise(r => require('https').get('https://example.com', r))}.

Promises work too: ${() => new Promise(r => setTimeout(r, 3e3, 'Resolved after 3 seconds'))}.

There's other stuff: ${(env, write) => write.all(123, 'Mix and match', Infinity, String.fromCodePoint(0x2026), new Promise(r => setTimeout(r, 2e3, 'with random timing')), () => 'and subfunctions if memory is an issue?')}`

module.exports = myTemplate