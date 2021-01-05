"use strict";

/**
 * Makes a C-style enum with reverse lookup
 * A caveat is enum cannot be numeric, like '12'.
 * However, the whole point of enums is to avoid magic values
 * so I doubt that is a major issues
 * @param {string[]} keys The keys
 */
const Enum = (...keys) => keys.reduce((a, v, i) => {
  a[v] = i;
  a[i] = v;
  return a;
}, {});
/**
 * WATSON types
 * The Uint is missing because the way JS stores 64-bit ints (BigInt)
 * can be signed or unsigned.
 * Uint is intentionally left missing to simplify code
 * @typedef {number} WatsonType
*/


const T = Enum('Int', // uint is missing because BigInt always preserves signs
'Float', 'String', 'Object', 'Array', 'Bool', 'Nil', 'Any');
const OPCODES = Enum('inew', 'iinc', 'ishl', 'iadd', 'ineg', 'isht', 'itof', 'itou', 'finf', 'fnan', 'fneg', 'snew', 'sadd', 'onew', 'oadd', 'anew', 'aadd', 'bnew', 'bneg', 'nnew', 'gdup', 'gpop', 'gswp');
/** A representation */

const A = Enum('B', 'u', 'b', 'a', 'A', 'e', 'i', "'", 'q', 't', 'p', '?', '!', '~', 'M', '@', 's', 'z', 'o', '.', 'E', '#', '%');
/** S representation */

const S = Enum('S', 'h', 'a', 'k', 'r', 'A', 'z', 'i', 'm', 'b', 'u', '$', '-', '+', 'g', 'v', '?', '^', '!', 'y', '/', 'e', ':');
const WATSONREP = {
  A,
  S
};
const typeMap = {
  bigint: T.Int,
  number: T.Float,
  string: T.String,
  object: T.Object,
  boolean: T.Bool
};
/**
 * Get the WATSON type of value
 * @param {*} value
 * @returns {WatsonType}
 */

const getType = value => {
  if (value === null) return T.Nil;
  if (Array.isArray(value)) return T.Array;
  const t = typeMap[typeof value];
  if (t !== undefined) return t;
  throw new TypeError(`Unknown type for ${value}`);
};
/**
 * Good'ol zip from python
 * @param  {...Iterable} iterable Any iterable
 */


function* zip(...iterable) {
  iterable = iterable.map(iter => Array.isArray(iter) ? iter[Symbol.iterator]() : iter);

  while (true) {
    const nextVal = iterable.map(iter => iter.next());
    if (nextVal.some(({
      done
    }) => done)) break;
    yield nextVal.map(({
      value
    }) => value);
  }
}
/**
 * Returns the current item and the last item of an iterable
 * @param  {...any} iterable Any iterable
 */


function* lastOne(iterable) {
  let last;

  for (const v of iterable) {
    const y = [last, v];
    last = v;
    yield y;
  }
}

module.exports = {
  Enum,
  T,
  OPCODES,
  WATSONREP,
  getType,
  zip,
  lastOne
};