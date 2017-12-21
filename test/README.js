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