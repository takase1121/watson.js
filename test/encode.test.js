const tap = require('tap')
const c = require('../lib/common')
const d = require('../lib/decode')
const e = require('../lib/encode')

const rep = (v, n) => Array(n).fill(v)
const exec = (f, ...d) => {
  const stack = []
  f(stack, ...d)
  return stack
}

tap.equal(e.leadingZero(64, 2n), 62, 'leadingZero')

tap.test('Dumping Opcodes', t => {
  const int3 = [c.OPCODES.inew, c.OPCODES.iinc, c.OPCODES.ishl, c.OPCODES.iinc]
  const ws = [c.OPCODES.snew, c.OPCODES.inew, c.OPCODES.iinc, ...rep(c.OPCODES.ishl, 5), c.OPCODES.sadd]
  t.strictSame(exec(e.dumpInt, 3n), int3)
  t.strictSame(exec(e.dumpFloat, 3), [...int3, c.OPCODES.itof])
  t.strictSame(exec(e.dumpFloat, ''), [c.OPCODES.fnan])
  t.strictSame(exec(e.dumpFloat, Infinity), [c.OPCODES.finf])
  t.strictSame(exec(e.dumpFloat, -Infinity), [c.OPCODES.finf, c.OPCODES.fneg])
  t.strictSame(exec(e.dumpString, ' '), ws)
  t.strictSame(exec(e.dumpObject, { ' ': 3n }), [c.OPCODES.onew, ...ws, ...int3, c.OPCODES.oadd])
  t.strictSame(exec(e.dumpArray, [3n]), [c.OPCODES.anew, ...int3, c.OPCODES.aadd])
  t.strictSame(exec(e.dumpBool, false), [c.OPCODES.bnew])
  t.strictSame(exec(e.dumpBool, true), [c.OPCODES.bnew, c.OPCODES.bneg])
  t.strictSame(exec(e.dumpNil), [c.OPCODES.nnew])
  t.end()
})

tap.test('stringify', t => {
  const src = {
    first: true,
    hello: 'world'
  }
  const data = e.stringify(src)
  tap.strictSame(d.parse(data), src, 'Able to parse what it produces')

  e.stringify(src, { prettify: true })
  e.stringify(src, { mode: 'S' })
  t.end()
})
