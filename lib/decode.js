"use strict";

const {
  Stack,
  execute
} = require('./vm');

const {
  tokenToOpcode,
  unsafeTokenToOpcode
} = require('./lex');

function parse(str, options) {
  var _options$mode, _options$unsafe;

  const mode = (_options$mode = options === null || options === void 0 ? void 0 : options.mode) !== null && _options$mode !== void 0 ? _options$mode : 'A';
  const unsafe = (_options$unsafe = options === null || options === void 0 ? void 0 : options.unsafe) !== null && _options$unsafe !== void 0 ? _options$unsafe : false;
  const stack = new Stack();
  const tokens = [...str];
  const opcodes = unsafe ? unsafeTokenToOpcode(tokens, mode) : tokenToOpcode(tokens, mode);
  return execute(stack, opcodes);
}

module.exports = {
  parse
};