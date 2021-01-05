const tap = require('tap')
const c = require('../lib/common')

tap.test('getType', t => {
  t.equal(c.getType(''), c.T.String)
  t.equal(c.getType(1), c.T.Float)
  t.equal(c.getType(1n), c.T.Int)
  t.equal(c.getType({}), c.T.Object)
  t.equal(c.getType(null), c.T.Nil)
  t.equal(c.getType(true), c.T.Bool)
  t.equal(c.getType([]), c.T.Array)
  t.throws(() => c.getType(Symbol.iterator))
  t.end()
})

tap.strictSame(
  [...c.zip([1, 2], [3, 4], ([5, 6, 7])[Symbol.iterator]())],
  [[1, 3, 5], [2, 4, 6]]
)

tap.strictSame(
  [...c.lastOne([1, 2, 3])],
  [[undefined, 1], [1, 2], [2, 3]]
)
