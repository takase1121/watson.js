const { WATSONREP, OPCODES, COPCODE_MAP } = require('./common')

function tokenToOpcode (tokens, mode) {
  return tokens
    .map((token, offset) => {
      const opcode = WATSONREP[mode][token]
      if (opcode === OPCODES.snew) mode = mode === 'A' ? 'S' : 'A'
      return { opcode, offset }
    })
    .filter(({ opcode }) => opcode !== undefined)
}

function unsafeTokenToOpcode (tokens, mode) {
  let optimized, lastOp
  return tokens
    .map((token, offset) => {
      const nowOp = WATSONREP[mode][token]
      if (nowOp === OPCODES.snew) mode = mode === 'A' ? 'S' : 'A'

      if (lastOp === OPCODES.snew || lastOp === OPCODES.sadd) {
        optimized = nowOp === OPCODES.inew
      }

      lastOp = nowOp
      if (optimized) {
        // istanbul ignore next
        return { opcode: COPCODE_MAP[nowOp] ?? nowOp, offset }
      } else {
        return { opcode: nowOp, offset }
      }
    })
    .filter(({ opcode }) => opcode !== undefined)
}

function unlex (opcodes, mode) {
  return opcodes
    .map(opcode => {
      const rep = WATSONREP[mode][opcode]
      if (opcode === OPCODES.snew) mode = mode === 'A' ? 'S' : 'A'
      return rep
    })
}

function prettify (ops, mode) {
  const output = []
  let last
  ops.forEach(now => {
    switch (mode) {
      case 'A':
        if (last === OPCODES.bnew && now === OPCODES.oadd) {
          output.push(OPCODES.bneg, OPCODES.bneg, OPCODES.oadd)
        } else if (last !== undefined && OPCODES[last][0] === 'i' && now === OPCODES.oadd) {
          output.push(OPCODES.ineg, OPCODES.ineg, OPCODES.oadd, OPCODES.gdup, OPCODES.gpop)
        } else {
          output.push(now)
        }
        break

      case 'S':
        if (last === OPCODES.ishl && now === OPCODES.iadd) { // Sharrk
          output.push(OPCODES.ineg, OPCODES.ineg, OPCODES.iadd)
        } else if (last === OPCODES.isht && now === OPCODES.iadd) { // ShaArrk
          output.push(OPCODES.ineg, OPCODES.ineg, OPCODES.iadd)
        } else if (now === OPCODES.onew) { // Samee
          output.push(OPCODES.inew, OPCODES.ishl, OPCODES.finf, OPCODES.gpop, OPCODES.gpop, OPCODES.onew)
        } else {
          output.push(now)
        }
    }
    if (now === OPCODES.snew) mode = mode === 'A' ? 'S' : 'A' // we also need to account for snew
    last = now
  })
  return output
}

module.exports = {
  tokenToOpcode,
  unsafeTokenToOpcode,
  unlex,
  prettify
}
