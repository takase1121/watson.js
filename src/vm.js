const { T, OPCODES, getType } = require('./common')

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
 * Pop from stack with stack size checking and type checking
 * @param {any[]} stack The stack
 * @param {import('../lib/common').WatsonType} expected Expected type
 * @param {number} i index of argument
 */
const pop = (stack, expected, i) => {
  if (!stack.length) {
    throw new StackUnderflowError()
  }
  const d = stack.pop()
  const found = getType(d)
  if (expected !== T.Any && expected !== found) {
    throw new TypeMismatchError(i, expected, found)
  }
  return d
}

/**
 * Massive inlined funcs
 */
const inew = stack => stack.push(0n)
const iinc = stack => {
  const x = pop(stack, T.Int, 0)
  stack.push(x + 1n)
}
const ishl = stack => {
  const x = pop(stack, T.Int, 0)
  stack.push(x << 1n)
}
const iadd = stack => {
  const y = pop(stack, T.Int, 0)
  const x = pop(stack, T.Int, 1)
  stack.push(x + y)
}
const ineg = stack => {
  const x = pop(stack, T.Int, 0)
  stack.push(-x)
}
const isht = stack => {
  const y = pop(stack, T.Int, 0)
  const x = pop(stack, T.Int, 1)
  stack.push(x << y)
}
const itof = stack => {
  const x = pop(stack, T.Int, 0)
  stack.push(Number(x))
}
const itou = stack => {
  const x = pop(stack, T.Int, 0)
  stack.push(BigInt.asUintN(64, x))
}
const finf = stack => stack.push(Number.POSITIVE_INFINITY)
const fnan = stack => stack.push(NaN)
const fneg = stack => {
  const x = pop(stack, T.Float, 0)
  stack.push(-x)
}
const snew = stack => stack.push('')
const sadd = stack => {
  const x = pop(stack, T.Int, 0)
  const s = pop(stack, T.String, 1)
  stack.push(s + CHAR[Number(x & 0xFFn)])
}
const onew = stack => stack.push({})
const oadd = stack => {
  const v = pop(stack, T.Any, 0)
  const k = pop(stack, T.String, 1)
  const o = pop(stack, T.Object, 2)
  o[k] = v
  stack.push(o)
}
const anew = stack => stack.push([])
const aadd = stack => {
  const x = pop(stack, T.Any, 0)
  const a = pop(stack, T.Array, 1)
  a.push(x)
  stack.push(a)
}
const bnew = stack => stack.push(false)
const bneg = stack => {
  const x = pop(stack, T.Bool, 0)
  stack.push(!x)
}
const nnew = stack => stack.push(null)
const gdup = stack => {
  const x = pop(stack, T.Any, 0)
  stack.push(x, x)
}
const gpop = stack => pop(stack, T.Any, 0)
const gswp = stack => {
  const y = pop(stack, T.Any, 0)
  const x = pop(stack, T.Any, 1)
  stack.push(y, x)
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
    return stack.pop()
  }
}

module.exports = {
  operations,
  execute
}
