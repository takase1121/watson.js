const tap = require('tap')
const c = require('../lib/common')
const v = require('../lib/vm')

const exec = (f, ...args) => { f(args); return args[0] }
const exec2 = (f, ...args) => { f(args); return args }

tap.test('WATSON operations', t => {
  const operations = v.operations.reduce((a, v, i) => { a[c.OPCODES[i]] = v; return a }, {})
  t.equal(exec(operations.inew), 0n)
  t.equal(exec(operations.iinc, 0n), 1n)
  t.equal(exec(operations.ishl, 1n), 2n)
  t.equal(exec(operations.iadd, 1n, 2n), 3n)
  t.equal(exec(operations.ineg, 1n), -1n)
  t.equal(exec(operations.isht, 4n, 1n), 8n)
  t.equal(exec(operations.itof, 0n), 0)
  t.equal(exec(operations.itou, -1n), BigInt.asUintN(64, -1n))
  t.equal(exec(operations.finf), Number.POSITIVE_INFINITY)
  t.true(Number.isNaN(exec(operations.fnan)))
  t.equal(exec(operations.fneg, 1), -1)
  t.equal(exec(operations.snew), '')
  t.equal(exec(operations.sadd, '', 104n), 'h')
  t.strictSame(exec(operations.onew), {})
  t.strictSame(exec(operations.oadd, {}, 'hello', 'world'), { hello: 'world' })
  t.true(Array.isArray(exec(operations.anew)))
  t.strictSame(exec(operations.aadd, [], 1), [1])
  t.equal(exec(operations.bnew), false)
  t.equal(exec(operations.bneg, false), true)
  t.equal(exec(operations.nnew), null)
  t.strictSame(exec2(operations.gdup, 1), [1, 1])
  t.strictSame(exec2(operations.gpop, 1), [])
  t.strictSame(exec2(operations.gswp, 1, 2), [2, 1])
  t.end()
})

tap.test('execute', t => {
  t.equal(
    v.execute(
      [],
      [
        { opcode: c.OPCODES.inew, offset: 0 },
        { opcode: c.OPCODES.iinc, offset: 1 }
      ]
    ),
    1n,
    'Normal'
  )
  t.throws(() => v.execute(
    [],
    [
      { opcode: c.OPCODES.inew, offset: 0 },
      { opcode: c.OPCODES.inew, offset: 1 }
    ],
    'Invalid stack'
  ))
  t.throws(() => v.execute(
    [],
    [
      { opcode: c.OPCODES.inew, offset: 0 },
      { opcode: c.OPCODES.bneg, offset: 1 }
    ],
    'Type mismatch'
  ))
  t.throws(() => v.execute(
    [],
    [
      { opcode: c.OPCODES.onew, offset: 0 },
      { opcode: c.OPCODES.oadd, offset: 1 }
    ],
    'Stack underflow'
  ))
  t.end()
})
