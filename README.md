# Func - y (funk-ee)

Auto-calling render functions.

## Features

* Streams (see below)
* Promises (see below)
* HTML safe: Ohoh &#60;sript src=&#34;//example.com/script&#34;&#62;&#60;/script&#62; is all escaped by the write.text() function.
  * Streams can be throw through there too if you don't trust a file.

## Usage

### Unnamed templates

```javascript
const myTemplate = require('..') `You can put anything here now.

Raw HTML, anything.

Including a stream can be done too: ${() => require('fs').createReadStream('file.txt')}.

A stream in a promise from a different source is fine too: ${() => new Promise(r => require('https').get('https://example.com', r))}.

Promises work too: ${() => new Promise(r => setTimeout(r, 3e3, 'Resolved after 3 seconds'))}.

There's other stuff: ${(env, write) => write.all(123, 'Mix and match', Infinity, String.fromCodePoint(0x2026), new Promise(r => setTimeout(r, 2e3, 'with random timing')), () => 'and subfunctions if memory is an issue?')}`

module.exports = myTemplate
```

The above will result in the following array:

```javascript
[ 'You can put anything here now.\n\nRaw HTML, anything.\n\nIncluding a stream can be done too: ',
  [Function],
  '.\n\nA stream in a promise from a different source is fine too: ',
  [Function],
  '.\n\nPromises work too: ',
  [Function],
  '.\n\nThere\'s other stuff: ',
  [Function] ]
```

### Named templates

For named templates (like this README.md from [`test/README.js`](./test/README.js)), there are several options:

```javascript
const README = require('../named')('README.md', 'text/markdown') `# Func - y (funk-ee)

Auto-calling render functions.

## Features

* Streams (see below)
* Promises (see below)
* HTML safe: ${(e, {text}) => text('Ohoh <sript src="//example.com/script"></script>')} is all escaped by the write.text() function.
  * Streams can be throw through there too if you don't trust a file.

## Usage

### Unnamed templates

\`\`\`javascript
${(env, { file }) => file([__dirname, './template.js'])}
\`\`\`

The above will result in the following array:

\`\`\`javascript
${({ util }) => util.inspect(require('./template.js'), false, 3, false)}
\`\`\`

### Named templates

For named templates (like this README.md from [\`test/README.js\`](./test/README.js)), there are several options:

\`\`\`javascript
${(env, write) => write.file([__dirname, './README.js'])}
\`\`\`

Results in a data like this:

\`\`\`javascript
${({ util }) => util.inspect(README, false, 4, false)}
\`\`\`

${
  (env, write) => write.all(
    write.file([__dirname, 'api.md']),
    '\n\n',
    write.file([__dirname, 'alts.md'])
  )
}`

const env = { util: require('util') }

README.writeToFile(require('path').join(__dirname, '../README.md'), {
  overwrite: true, env
}).then(console.log, console.error)
README.writeTo(process.stdout, env, false).catch(console.error)


module.exports = README
```

Results in a data like this:

```javascript
{ name: 'README.md',
  type: 'text/markdown',
  template: 
   [ '# Func - y (funk-ee)\n\nAuto-calling render functions.\n\n## Features\n\n* Streams (see below)\n* Promises (see below)\n* HTML safe: ',
     [Function],
     ' is all escaped by the write.text() function.\n  * Streams can be throw through there too if you don\'t trust a file.\n\n## Usage\n\n### Unnamed templates\n\n```javascript\n',
     [Function],
     '\n```\n\nThe above will result in the following array:\n\n```javascript\n',
     [Function],
     '\n```\n\n### Named templates\n\nFor named templates (like this README.md from [`test/README.js`](./test/README.js)), there are several options:\n\n```javascript\n',
     [Function],
     '\n```\n\nResults in a data like this:\n\n```javascript\n',
     [Function],
     '\n```\n\n',
     [Function] ],
  middleware: [Function: middleware],
  createMiddleWare: [Function: createMiddleWare],
  writeTo: [Function: writeTo],
  writeToFile: [Function: writeToFile] }
```

## API

```javascript
const {template, named, namedMiddleware} = require('func-y')
// require('func-y') === require('func-y').template
let arr = template`
* Text string 
* ${'other data'} 
* ${1234e6} 
* ${() => 'a function'}
* ${env => env.data}
* ${({data}) => data}
* ${(env, write) => write('text and ').then(() => env.aPromise = new Promise(r => setTimeout(r,32, 'a promise')))}
* ${async env => await env.aPromise}
* ${(env, write) => write.next(/* err */ /*, data */)}
* ${
  // etc
  ''
}`

let keyed = named('key', 'application/mimetype') `Roughly the same as above.
${() => new Promise(r => setTimeout(r, 1e3, 'Really.'))}
${() => new Promise(r => setTimeout(r, 1e3, 'Seriously.'))}`

keyed.writeTo(process.stdout, {/* ...env */}, false) 
// (writable, env, autoclose)
keyed.writeToFile('test.txt', {overwrite: false, encoding: 'utf8'})
// (filename, {...options})

// Express ready:
const app = require('express')()
app.use(keyed.createMiddleWare())

// can use in different part of the app

const sub = require('express')

sub.use(namedMiddleware('key'))
```

and so-on and so-fourth.

See the documents internals in [`named.js`](./named.js), [`template.js`](./template.js), [`writer.js`](./writer.js) and [`write-file.js`](./write-file.js).

Meanwhile, [`index.js`](./index.js) just holds everything together. I think.


## Vs Alternatives

func-y will render on-the-fly as an alternative to the collect-and-display of similar systems, such as `HyperHTML`/`ViperHTML` and `lit-html` styles.

First-render is exceedingly fast if the main styles are available.

A simple `for await` or `for (const thing of source) await write(stuff(thing))`

It is a streaming based parser/builder, and capable of all of the same things as the Hyper and lit server side renderers are.

It has a set of built in `write` functions (sequential `write.all(data, data, data, ...datas)`, `write.next(err, data)`, `write.text(unsafe_string)` and plain `write(data)`).

It's capable of writing/caching files (less useful with the exception of heavy stuff like markdown/markdown-it).

It handles streams, promises and delays consistently.

Can puke in data from anywhere (including different sites)

It handles all data types (except `symbol`) in a consistent fashion.

It's fast and (primarily) in-memory.

It's lightweight, and capable of all of the above out-of-the-box (in node).

If looking for a highly interactive DOM, use hyperhtml/viperhtml.

If looking for a simple streaming HTML (or just anything text based) output, use this.

TL;DR it's function based sequential data collection/export with enough extras to be used... basically anywhere.
