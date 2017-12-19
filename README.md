# Func - y

Auto - calling render functions.

## Usage

### Unnamed templates

```javascript
const myTemplate = require('..') `You can put anything here now.

Raw HTML, anything.

Including a stream can be done too: ${() => require('fs').createReadStream('file.txt')}.

A stream from a different source is fine too: ${() => new Promise(r => require('https').get('https://example.com', r))}.

Promises work too: ${() => new Promise(r => setTimeout(r, 3e3, 'Resolved after 3 seconds'))}.

There's other stuff: ${(env, write) => write.all(123, 'Mix and match', Infinity, String.fromCodePoint(0x2026), new Promise(r => setTimeout(r, 2e3, 'with random timing')), () => 'and subfunctions if memory is an issue?')}`

module.exports = myTemplate
```

The above will result in the following array:

```javascript
[ 'You can put anything here now.\n\nRaw HTML, anything.\n\nIncluding a stream can be done too: ',
  [Function],
  '.\n\nA stream from a different source is fine too: ',
  [Function],
  '.\n\nPromises work too: ',
  [Function],
  '.\n\nThere\'s other stuff: ',
  [Function] ]
```

### Named templates

For named templates (like this README.md from [`test/README.js`](./test/README.js)), there are several options:

```javascript
const README = require('../named')('README.md', 'text/markdown') `# Func - y

Auto - calling render functions.

## Usage

### Unnamed templates

\`\`\`javascript
${({ fs, path }) => fs.createReadStream(path.join(__dirname, './template.js'))}
\`\`\`

The above will result in the following array:

\`\`\`javascript
${({ util }) => util.inspect(require('./template.js'), false, 3, false)}
\`\`\`

### Named templates

For named templates (like this README.md from [\`test/README.js\`](./test/README.js)), there are several options:

\`\`\`javascript
${({ fs, path }) => fs.createReadStream(path.join(__dirname, './README.js'))}
\`\`\`

Results in a data like this:

\`\`\`javascript
${({ util }) => util.inspect(README, false, 4, false)}
\`\`\`

${({ fs, path }) => fs.createReadStream(path.join(__dirname, 'api.md'))}`

const env = {
  fs: require('fs'),
  util: require('util'),
  path: require('path')
}

README.writeToFile(require('path').join(__dirname, '../README.md'), {
  overwrite: true, env
}).then(console.log, console.error)
README.writeTo(process.stdout, env, false)


module.exports = README
```

Results in a data like this:

```javascript
{ name: 'README.md',
  type: 'text/markdown',
  template: 
   [ '# Func - y\n\nAuto - calling render functions.\n\n## Usage\n\n### Unnamed templates\n\n```javascript\n',
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
