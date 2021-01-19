const tap = require('tap')
const c = require('../lib/common')
const l = require('../lib/lex')

tap.strictSame(
  l.tokenToOpcode([...'Bu?Sh$Bu'], 'A'),
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
  l.unlex(
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

const input1 = l.unlex(
  [
    c.OPCODES.snew, c.OPCODES.inew,
    c.OPCODES.iinc, c.OPCODES.ishl,
    c.OPCODES.sadd, c.OPCODES.gpop,
    c.OPCODES.snew, c.OPCODES.gpop,
    c.OPCODES.sadd, c.OPCODES.inew,
    c.OPCODES.iinc, c.OPCODES.ishl,
    c.OPCODES.sadd, c.OPCODES.gpop
  ],
  'A'
)
const output1 = [
  { opcode: c.OPCODES.snew, offset: 0 }, { opcode: c.OPCODES.fnew, offset: 1 },
  { opcode: c.OPCODES.finc, offset: 2 }, { opcode: c.OPCODES.fshl, offset: 3 },
  { opcode: c.OPCODES.sadf, offset: 4 }, { opcode: c.OPCODES.gpop, offset: 5 },
  { opcode: c.OPCODES.snew, offset: 6 }, { opcode: c.OPCODES.gpop, offset: 7 },
  { opcode: c.OPCODES.sadd, offset: 8 }, { opcode: c.OPCODES.fnew, offset: 9 },
  { opcode: c.OPCODES.finc, offset: 10 }, { opcode: c.OPCODES.fshl, offset: 11 },
  { opcode: c.OPCODES.sadf, offset: 12 }, { opcode: c.OPCODES.gpop, offset: 13 }
]
tap.strictSame(
  l.unsafeTokenToOpcode(input1, 'A'),
  output1
)

tap.strictSame(
  l.prettify(
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
