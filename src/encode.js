const { OPCODES, getType } = require('./common')
const { prettify, unlex } = require('./lex')

/**
 * Count the number of leading zeros of a BigInt
 * There ought to be better ways to do this, but I only know this way
 * @param {number} width Size of BigInt in bits
 * @param {bigint} x
 */
const leadingZero = (width, x) => width - BigInt.prototype.toString.call(x, 2).length

const dumpAny = (stack, x) => {
  dumpMap[getType(x)](stack, x)
}

const dumpInt = (stack, n) => {
  const msb = 63 - leadingZero(64, n)
  stack.push(OPCODES.inew, OPCODES.iinc)

  for (let i = msb - 1; i >= 0; i--) {
    stack.push(OPCODES.ishl)
    const mask = BigInt(1 << i)
    if ((n & mask) !== 0n) {
      stack.push(OPCODES.iinc)
    }
  }
}

const dumpFloat = (stack, n) => {
  if (typeof n !== 'number' || Number.isNaN(n)) {
    stack.push(OPCODES.fnan)
  } else if (!Number.isFinite(n)) {
    stack.push(OPCODES.finf)
    if (n === Number.NEGATIVE_INFINITY) stack.push(OPCODES.fneg)
  } else {
    dumpInt(stack, BigInt(n))
    stack.push(OPCODES.itof)
  }
}

const dumpString = (stack, str) => {
  stack.push(OPCODES.snew)
  for (const char of str) {
    const code = BigInt(char.charCodeAt())
    dumpInt(stack, code)
    stack.push(OPCODES.sadd)
  }
}

const dumpObject = (stack, obj) => {
  stack.push(OPCODES.onew)
  for (const [key, value] of Object.entries(obj)) {
    dumpString(stack, key)
    dumpAny(stack, value)
    stack.push(OPCODES.oadd)
  }
}

const dumpArray = (stack, array) => {
  stack.push(OPCODES.anew)
  for (const v of array) {
    dumpAny(stack, v)
    stack.push(OPCODES.aadd)
  }
}

const dumpBool = (stack, bool) => bool ? stack.push(OPCODES.bnew, OPCODES.bneg) : stack.push(OPCODES.bnew)
const dumpNil = (stack) => stack.push(OPCODES.nnew)

const dumpMap = [
  dumpInt,
  dumpFloat,
  dumpString,
  dumpObject,
  dumpArray,
  dumpBool,
  dumpNil,
  dumpAny
]

function stringify (x, options) {
  const pretty = options?.prettify ?? false
  const mode = options?.mode ?? 'A'

  let stack = []
  dumpAny(stack, x)
  if (pretty) stack = prettify(stack, mode)

  let output = ''
  for (const v of unlex(stack, mode)) {
    output += v
  }
  return output
}

module.exports = {
  leadingZero,
  dumpAny,
  dumpInt,
  dumpFloat,
  dumpString,
  dumpObject,
  dumpArray,
  dumpBool,
  dumpNil,
  stringify
}
