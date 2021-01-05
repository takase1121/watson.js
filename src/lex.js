const { WATSONREP, OPCODES, lastOne } = require('./common')

/**
 * Returns string iterator of the string
 * @param {string} str
 */
function * getTokens (str) {
  const slen = str.length
  for (let i = 0; i < slen; i++) {
    yield ({ token: str[i], offset: i })
  }
}

function * tokenToOpcode (tokens, mode) {
  for (const { token, offset } of tokens) {
    const opcode = WATSONREP[mode][token]
    if (opcode === OPCODES.snew) mode = mode === 'A' ? 'S' : 'A'
    if (opcode !== undefined) yield ({ opcode, offset })
  }
}

function * unlex (opcodes, mode) {
  for (const opcode of opcodes) {
    const rep = WATSONREP[mode][opcode]
    if (opcode === OPCODES.snew) mode = mode === 'A' ? 'S' : 'A'
    yield rep
  }
}

function * prettify (ops, mode) {
  for (const [last, now] of lastOne(ops)) {
    switch (mode) {
      case 'A':
        if (last === OPCODES.bnew && now === OPCODES.oadd) {
          yield * [OPCODES.bneg, OPCODES.bneg, OPCODES.oadd]
        } else if (last !== undefined && OPCODES[last].startsWith('i') && now === OPCODES.oadd) {
          yield * [OPCODES.ineg, OPCODES.ineg, OPCODES.oadd, OPCODES.gdup, OPCODES.gpop]
        } else {
          yield now
        }
        break

      case 'S':
        if (last === OPCODES.ishl && now === OPCODES.iadd) { // Sharrk
          yield * [OPCODES.ineg, OPCODES.ineg, OPCODES.iadd]
        } else if (last === OPCODES.isht && now === OPCODES.iadd) { // ShaArrk
          yield * [OPCODES.ineg, OPCODES.ineg, OPCODES.iadd]
        } else if (now === OPCODES.onew) { // Samee
          yield * [OPCODES.inew, OPCODES.ishl, OPCODES.finf, OPCODES.gpop, OPCODES.gpop, OPCODES.onew]
        } else {
          yield now
        }
    }
    if (now === OPCODES.snew) mode = mode === 'A' ? 'S' : 'A' // we also need to account for snew
  }
}

module.exports = {
  getTokens,
  tokenToOpcode,
  unlex,
  prettify
}
