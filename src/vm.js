const { T, OPCODES } = require('./common')

/**
 * Character lookup table
 */
const CHAR = Array(256).fill().map((_, i) => String.fromCharCode(i))

/**
 * Throwed when stack has insufficient value for the opcode
 */
class StackUnderflowError extends Error {
  constructor () {
    super()
    this.message = 'Stack underflow!'
  }
}

/**
 * Throwed when all tokens are consumed but stack has multiple values
 */
class InvalidStackError extends Error {
  constructor (stack) {
    super()
    this.message = 'Stack has more than 1 items at EOF'
    this.runStack = stack
  }
}

/** Throwed when arguments are different than prototype */
class TypeMismatchError extends Error {
  constructor (i, expected, found) {
    super()
    this.message = `stack item ${i} expected to be ${T[expected]}, got ${T[found]}`
  }
}

/**
 * A wrapper around an array which provides custom push and pop operations
 */
class Stack {
  constructor () {
    this.segment = []
  }

  get length () {
    return this.segment.length / 2
  }

  push (type, value) {
    this.segment.push(value, type)
  }

  pop (expected, i) {
    if (!this.length) {
      throw new StackUnderflowError()
    }
    const type = this.segment.pop()
    const value = this.segment.pop()
    if (expected !== T.Any && type !== expected) {
      throw new TypeMismatchError(i, expected, type)
    }
    return [value, type]
  }
}

/**
 * Massive inlined funcs
 */
const inew = stack => stack.push(T.Int, 0n)
const iinc = stack => {
  const [x] = stack.pop(T.Int, 0)
  stack.push(T.Int, x + 1n)
}
const ishl = stack => {
  const [x] = stack.pop(T.Int, 0)
  stack.push(T.Int, x << 1n)
}
const iadd = stack => {
  const [y] = stack.pop(T.Int, 0)
  const [x] = stack.pop(T.Int, 1)
  stack.push(T.Int, x + y)
}
const ineg = stack => {
  const [x] = stack.pop(T.Int, 0)
  stack.push(T.Int, -x)
}
const isht = stack => {
  const [y] = stack.pop(T.Int, 0)
  const [x] = stack.pop(T.Int, 1)
  stack.push(T.Int, x << y)
}
const itof = stack => {
  const [x] = stack.pop(T.Int, 0)
  stack.push(T.Float, Number(x))
}
const itou = stack => {
  const [x] = stack.pop(T.Int, 0)
  stack.push(T.Int, BigInt.asUintN(64, x))
}
const finf = stack => stack.push(T.Float, Number.POSITIVE_INFINITY)
const fnan = stack => stack.push(T.Float, NaN)
const fneg = stack => {
  const [x] = stack.pop(T.Float, 0)
  stack.push(T.Float, -x)
}
const snew = stack => stack.push(T.String, '')
const sadd = stack => {
  const [x] = stack.pop(T.Int, 0)
  const [s] = stack.pop(T.String, 1)
  stack.push(T.String, s + CHAR[Number(x & 0xFFn)])
}
const onew = stack => stack.push(T.Object, {})
const oadd = stack => {
  const [v] = stack.pop(T.Any, 0)
  const [k] = stack.pop(T.String, 1)
  const [o] = stack.pop(T.Object, 2)
  o[k] = v
  stack.push(T.Object, o)
}
const anew = stack => stack.push(T.Array, [])
const aadd = stack => {
  const [x] = stack.pop(T.Any, 0)
  const [a] = stack.pop(T.Array, 1)
  a.push(x)
  stack.push(T.Array, a)
}
const bnew = stack => stack.push(T.Bool, false)
const bneg = stack => {
  const [x] = stack.pop(T.Bool, 0)
  stack.push(T.Bool, !x)
}
const nnew = stack => stack.push(T.Nil, null)
const gdup = stack => {
  const [x, type] = stack.pop(T.Any, 0)
  stack.push(type, x)
  stack.push(type, x)
}
const gpop = stack => stack.pop(T.Any, 0)
const gswp = stack => {
  const [y, type1] = stack.pop(T.Any, 0)
  const [x, type2] = stack.pop(T.Any, 1)
  stack.push(type1, y)
  stack.push(type2, x)
}

/**
 * Mapping of opcodes to actual instructions
 */
const operations = [
  inew,
  iinc,
  ishl,
  iadd,
  ineg,
  isht,
  itof,
  itou,
  finf,
  fnan,
  fneg,
  snew,
  sadd,
  onew,
  oadd,
  anew,
  aadd,
  bnew,
  bneg,
  nnew,
  gdup,
  gpop,
  gswp
]

function execute (stack, opcodes) {
  let lastOp = {}
  try {
    for (const { opcode, offset } of opcodes) {
      lastOp = { opcode, offset }
      const operation = operations[opcode]
      operation(stack)
    }
  } catch (e) {
    e.offset = lastOp.offset
    e.operation = OPCODES[lastOp.opcode]
    e.message += ` at ${e.offset}(${e.operation})`
    throw e
  }

  if (stack.length !== 1) {
    throw new InvalidStackError(stack)
  } else {
    return stack.pop(T.Any)[0]
  }
}

module.exports = {
  operations,
  execute,
  Stack
}
