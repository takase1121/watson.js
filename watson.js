/**
 * WATSON types
 * The Uint is missing because the way JS stores 64-bit ints (BigInt)
 * can be signed or unsigned.
 * Uint is intentionally left missing to simplify code
 * @typedef {number} WatsonType
*/
const t = {
  Int: 0, // uint is missing because BigInt always preserves signs
  Float: 1,
  String: 2,
  Object: 3,
  Array: 4,
  Bool: 5,
  Nil: 6,
  Any: 7
}
/**
 * Inverse mapping of WATSON types
 */
const invt = Object.keys(t)

/**
 * Throwed when stack has insufficient value for the opcode
 */
class StackUnderflowError extends Error {
  constructor (pos, opcode, expected, has) {
    super()
    this.message = `${pos}:${opcode} : Expected ${expected} value(s), got ${has}`
  }
}

/**
 * Throwed when all tokens are consumed but stack has multiple values
 */
class InvalidStackError extends Error {
  constructor () {
    super()
    this.message = 'Stack has more than 1 items at EOF'
  }
}

/** Throwed when arguments are different than prototype */
class TypeMismatchError extends Error {
  constructor (pos, opcode, i, expected, found) {
    super()
    this.message = `${pos}:${opcode} : stack item ${i} expected to be ${invt[expected]}, got ${invt[found]}`
  }
}

/**
 * Get the WATSON type of value
 * @param {*} value
 * @returns {WatsonType}
 */
const getType = value => {
  if (Array.isArray(value)) return t.Array
  switch (typeof value) {
    case 'bigint':
      return t.Int
    case 'number':
      return t.Float
    case 'string':
      return t.String
    case 'object':
      return value === null ? t.Nil : t.Object
    case 'boolean':
      return t.Bool
    default:
      throw new TypeError(`Unknown type for ${value}`)
  }
}

/**
 * Validate type passed to the operations based on prototype
 * @param {WatsonType[]} proto The prototype of operation
 * @param {any[]} s The arguments passed to operation
 * @param {number} pos Position of opcode in input
 * @param {string} opcode The opcode in human-readable form
 */
const validateType = (proto, s, pos, opcode) => {
  if (s.length !== proto.length) { throw new StackUnderflowError(pos, opcode, proto.length, s.length) }
  for (let i = 0; i < proto.length; i++) {
    const expected = proto[i]
    if (expected === t.Any) continue

    const found = getType(s[i])
    if (expected !== found) { throw new TypeMismatchError(pos, opcode, i, expected, found) }
  }
}

/**
 * Generates a wrapper for an operation
 * @param {function} f The operation
 * @param  {...WatsonType} proto The prototype of the operation
 */
const op = (f, ...proto) => (pos, opcode) => stack => {
  const l = stack.length - proto.length
  const args = stack.slice(l)
  stack = stack.slice(0, l)
  validateType(proto, args, pos, opcode)
  const r = f(...args)
  Array.isArray(r) ? stack.push(...r) : stack.push(r)
  return stack
}

const operations = {
  inew: op(_ => 0n),
  iinc: op(x => x + 1n, t.Int),
  ishl: op(x => x << 1n, t.Int),
  iadd: op((y, x) => x + y, t.Int, t.Int),
  ineg: op(x => -x, t.Int),
  isht: op((y, x) => x << y, t.Int, t.Int),
  itof: op(x => Number(x), t.Int),
  itou: op(x => BigInt.asUintN(64, x), t.Int),
  finf: op(_ => Number.POSITIVE_INFINITY),
  fnan: op(_ => NaN),
  fneg: op(x => -x, t.Float),
  snew: op(_ => ''),
  sadd: op((s, x) => s + String.fromCharCode(Number(x & 0xFFn)), t.String, t.Int),
  onew: op(_ => ({})),
  oadd: op((o, k, v) => { o[k] = v; return o }, t.Object, t.String, t.Any),
  anew: op(_ => [[]]), // double arrays to circumvent Array.isArray check above
  aadd: op((x, a) => { a.push(x); return [a] }, t.Any, t.Array),
  bnew: op(_ => false),
  bneg: op(x => !x, t.Bool),
  nnew: op(_ => null),
  gdup: op(x => [x, x], t.Any),
  gpop: op(_ => [], t.Any),
  gswp: op((y, x) => [x, y], t.Any, t.Any)
}

/** Type A lexer */
const A = {
  B: 'inew',
  u: 'iinc',
  b: 'ishl',
  a: 'iadd',
  A: 'ineg',
  e: 'isht',
  i: 'itof',
  "'": 'itou',
  q: 'finf',
  t: 'fnan',
  p: 'fneg',
  '?': 'snew',
  '!': 'sadd',
  '~': 'onew',
  M: 'oadd',
  '@': 'anew',
  s: 'aadd',
  z: 'bnew',
  o: 'bneg',
  '.': 'nnew',
  E: 'gdup',
  '#': 'gpop',
  '%': 'gswp'
}
/** Type S lexer */
const S = {
  S: 'inew',
  h: 'iinc',
  a: 'ishl',
  k: 'iadd',
  r: 'ineg',
  A: 'isht',
  z: 'itof',
  i: 'itou',
  m: 'finf',
  b: 'fnan',
  u: 'fneg',
  $: 'snew',
  '-': 'sadd',
  '+': 'onew',
  g: 'oadd',
  v: 'anew',
  '?': 'aadd',
  '^': 'bnew',
  '!': 'bneg',
  y: 'nnew',
  '/': 'gdup',
  e: 'gpop',
  ':': 'gswp'
}
const opcodes = { A, S }

/**
 * Returns string iterator of the string
 * @param {string} str
 */
function * lex (str) {
  const slen = str.length
  for (let i = 0; i < slen; i++) {
    yield ({ token: str[i], pos: i })
  }
}

/**
 * A generator to convert tokens to operations
 * @param {*} tokens An iterable of tokens
 * @param {string} mode Initial mode of the lexer
 */
function * tokenToOperation (tokens, mode) {
  for (const { token, pos } of tokens) {
    const opcode = opcodes[mode][token]
    if (!opcode) continue
    if (opcode === 'snew') mode = mode === 'A' ? 'S' : 'A'
    yield operations[opcode](pos, opcode)
  }
}

/**
 * The VM, probably
 * @param {any[]} stack The stack
 * @param {*} tokens An iterable of tokens
 */
function run (stack, ops) {
  while (true) {
    const { done, value: operation } = ops.next()
    if (done) {
      if (stack.length === 1) {
        return stack.pop()
      } else {
        throw new InvalidStackError()
      }
    } else {
      stack = operation(stack)
    }
  }
}

function parse (str, mode = 'A') {
  const stack = []
  const tokens = lex(str)
  const ops = tokenToOperation(tokens, mode)
  return run(stack, ops)
}

module.exports = {
  t,
  invt,
  StackUnderflowError,
  InvalidStackError,
  TypeMismatchError,
  getType,
  validateType,
  op,
  operations,
  lex,
  tokenToOperation,
  run,
  parse
}
