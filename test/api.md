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
