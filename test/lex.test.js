const tap = require('tap')
const c = require('../lib/common')
const l = require('../lib/lex')

const exec = (f, ...args) => [...f(...args)]
tap.strictSame(
  exec(l.getTokens, 'hello'),
  [
    { token: 'h', offset: 0 },
    { token: 'e', offset: 1 },
    { token: 'l', offset: 2 },
    { token: 'l', offset: 3 },
    { token: 'o', offset: 4 }
  ]
)

const tokens = l.getTokens('Bu?Sh$Bu')
tap.strictSame(
  exec(l.tokenToOpcode, tokens, 'A'),
  [
    { opcode: c.OPCODES.inew, offset: 0 },
    { opcode: c.OPCODES.iinc, offset: 1 },
    { opcode: c.OPCODES.snew, offset: 2 },
    { opcode: c.OPCODES.inew, offset: 3 },
    { opcode: c.OPCODES.iinc, offset: 4 },
    { opcode: c.OPCODES.snew, offset: 5 },
    { opcode: c.OPCODES.inew, offset: 6 },
    { opcode: c.OPCODES.iinc, offset: 7 }
  ]
)

tap.strictSame(
  exec(
    l.unlex,
    [
      c.OPCODES.inew,
      c.OPCODES.snew,
      c.OPCODES.inew,
      c.OPCODES.snew,
      c.OPCODES.inew
    ],
    'A'
  ),
  ['B', '?', 'S', '$', 'B']
)

tap.strictSame(
  exec(
    l.prettify,
    [
      c.OPCODES.bnew, c.OPCODES.oadd,
      c.OPCODES.inew, c.OPCODES.oadd,
      c.OPCODES.gpop,
      c.OPCODES.snew,
      c.OPCODES.ishl, c.OPCODES.iadd,
      c.OPCODES.isht, c.OPCODES.iadd,
      c.OPCODES.onew,
      c.OPCODES.snew,
      c.OPCODES.inew
    ],
    'A'
  ),
  [
    c.OPCODES.bnew, c.OPCODES.bneg, c.OPCODES.bneg, c.OPCODES.oadd,
    c.OPCODES.inew, c.OPCODES.ineg, c.OPCODES.ineg, c.OPCODES.oadd, c.OPCODES.gdup, c.OPCODES.gpop,
    c.OPCODES.gpop,
    c.OPCODES.snew,
    c.OPCODES.ishl, c.OPCODES.ineg, c.OPCODES.ineg, c.OPCODES.iadd,
    c.OPCODES.isht, c.OPCODES.ineg, c.OPCODES.ineg, c.OPCODES.iadd,
    c.OPCODES.inew, c.OPCODES.ishl, c.OPCODES.finf, c.OPCODES.gpop, c.OPCODES.gpop, c.OPCODES.onew,
    c.OPCODES.snew,
    c.OPCODES.inew
  ]
)
