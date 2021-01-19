const { Suite } = require('benchmark')
const { parse, stringify } = require('.')
const suite = new Suite()

const data = { hello: 'world' }
suite.add('stringify', () => stringify(data))

const s = stringify(data)
suite.add('parse', () => parse(s))
suite.add('parse unsafe', () => parse(s, 'A', true))

suite.on('cycle', event => console.log(String(event.target)))
suite.run()
