const tap = require('tap')
const w = require('./watson')

const exec = (f, ...args) => f(0, 0)(args)[0]

tap.test('getType', t => {
  t.equal(w.getType(''), w.t.String)
  t.equal(w.getType(1), w.t.Float)
  t.equal(w.getType(1n), w.t.Int)
  t.equal(w.getType({}), w.t.Object)
  t.equal(w.getType(null), w.t.Nil)
  t.equal(w.getType(true), w.t.Bool)
  t.equal(w.getType([]), w.t.Array)
  t.throws(() => w.getType(Symbol.iterator))
  t.end()
})

tap.test('validateType', t => {
  w.validateType([w.t.String, w.t.Nil], ['', null], 1, 'idk')
  t.throws(() => w.validateType([w.t.String], []))
  t.throws(() => w.validateType([w.t.String], [1]))
  t.end()
})

tap.test('WATSON operations', t => {
  t.equal(exec(w.operations.inew), 0n)
  t.equal(exec(w.operations.iinc, 0n), 1n)
  t.equal(exec(w.operations.ishl, 1n), 2n)
  t.equal(exec(w.operations.iadd, 1n, 2n), 3n)
  t.equal(exec(w.operations.ineg, 1n), -1n)
  t.equal(exec(w.operations.isht, 4n, 1n), 16n)
  t.equal(exec(w.operations.itof, 0n), 0)
  t.equal(exec(w.operations.itou, -1n), BigInt.asUintN(64, -1n))
  t.equal(exec(w.operations.finf), Number.POSITIVE_INFINITY)
  t.true(Number.isNaN(exec(w.operations.fnan)))
  t.equal(exec(w.operations.fneg, 1), -1)
  t.equal(exec(w.operations.snew), '')
  t.equal(exec(w.operations.sadd, '', 104n), 'h')
  t.match(exec(w.operations.onew), {})
  t.match(exec(w.operations.oadd, {}, 'hello', 'world'), { hello: 'world' })
  t.true(Array.isArray(exec(w.operations.anew)))
  t.match(exec(w.operations.aadd, 1, []), [1])
  t.equal(exec(w.operations.bnew), false)
  t.equal(exec(w.operations.bneg, false), true)
  t.equal(exec(w.operations.nnew), null)
  t.match(w.operations.gdup(0, 0)([1]), [1, 1])
  t.match(w.operations.gpop(0, 0)([1]), [])
  t.match(w.operations.gswp(0, 0)([1, 2]), [2, 1])
  t.end()
})

tap.throws(() => w.parse('BB'), 'InvalidStackError')

tap.match(
  w.parse(
    `~?ShaaaaaarrShaaaaarrkShaaarrk-
    SameeShaaaaaarrShaaaaarrkShaarrkShrrk-
    ShaaaaaarrShaaaaakSameeShaaarrkShaarrk-
    ShaaaaaarrShaaaaarrkShaaarrkShaarrk-
    ShaaaaaarrShaaaaarrkShaaarrkShaarrkSharrkShrrk-$
    BubbbbbbBubbbbbaBubbbbaBubbaBubaBua!
    BubbbbbbBubbbbbaBubbbaBubbaBubaBua!
    BubbbbbbBubbbbbaBubbbbaBuba!
    BubbbbbbBubbbbbaBubbbaBubba!
    BubbbbbbBubbbbbaBubba!M?
    ShaaaaaaShaaaaakShaakShak-
    ShaaaaaaShaaaaakShaaakShk-
    ShaaaaaaShaaaaakShaaaakShak-
    ShaaaaaaShaaaaakShaaaakShakShk-
    ShaaaaaaShaaaaakShaaaakShaak-
    ^!!!!!!!!!!!!!g`
  ),
  {
    first: true,
    hello: 'world'
  },
  'Example'
)
