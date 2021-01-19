"use strict";

const {
  Stack,
  execute
} = require('./vm');

const {
  getTokens,
  tokenToOpcode
} = require('./lex');

function parse(str, mode = 'A') {
  const stack = new Stack();
  const tokens = getTokens(str);
  const opcodes = tokenToOpcode(tokens, mode);
  return execute(stack, opcodes);
}

module.exports = {
  parse
};