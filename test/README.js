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

${async ({ fs, path }, write) => {
  await write(fs.createReadStream(path.join(__dirname, 'api.md')))
  await write('\n\n')
  await write(fs.createReadStream(path.join(__dirname, 'alts.md')))
  return
}}`

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