const { EventEmitter } = require('events')
const extractTemplate = require('./template')

const namedTemplates = new Map()
const templateEmitter = new EventEmitter().on('template', namedTemplates.set.bind(namedTemplates))
const set = (name, tmpl) => {
  templateEmitter.emit('template', name, tmpl)
  return namedTemplates
}

const namedTemplate = (name, type = 'text/html') => (...v) => set(name, {
  name,
  type,
  template: extractTemplate(...v),
  middleware(req, res) {
    res.setHeader('content-type', this.type)
    return require('./writer').writeIter(res, 'utf8', this.template, res.locals || {}, true, true)
  },
  createMiddleWare() {
    return this.middleware.bind(this)
  },
  writeTo(writable, env = {}, enc = 'utf8', autoclose = false) {
    return require('./writer').writeIter(writable, enc, this.template, env, autoclose)
  },
  writeToFile(path, opts = {}) {
    return require('./write-file')(path, this.template, opts)
  }
}).get(name)
namedTemplate.store = namedTemplates

module.exports = namedTemplate
module.exports.named = namedTemplate
module.exports.namedTemplate = namedTemplate
module.exports.namedTemplates = namedTemplates

const namedMiddleware = name => {
  let template = namedTemplates.get(name)
  if (template) return template.middleware.bind(template)
  let backHandled = new Set
  let ready = false
  let handle = (req, res) => ready
    ? template.middleware(req, res)
    : backHandled.add([req, res])
  ;

  let m = async tmpl => {
    template = tmpl
    handle = tmpl.middleware.bind(tmpl)
    for (let req_res of backHandled) {
      await tmpl.middleware(res_res.req, req_res.res)
      backHandled.delete(req_res)
    }
    ready = true
  }

  templateEmitter.on('template', function check(tx, tmpl) {
    if (tx === name) {
      templateEmitter.removeListener('template', check)
      m(tmpl)
    }
  })
  return handle
}

namedTemplate.createMiddleWare = namedMiddleware
module.exports.namedMiddleware = namedMiddleware
