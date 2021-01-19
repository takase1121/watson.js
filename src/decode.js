const { Stack, execute } = require('./vm')
const { tokenToOpcode, unsafeTokenToOpcode } = require('./lex')

function parse (str, options) {
  const mode = options?.mode ?? 'A'
  const unsafe = options?.unsafe ?? false

  const stack = new Stack()
  const tokens = [...str]
  const opcodes = unsafe ? unsafeTokenToOpcode(tokens, mode) : tokenToOpcode(tokens, mode)
  return execute(stack, opcodes)
}

module.exports = {
  parse
}
