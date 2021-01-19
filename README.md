# WATSON.js

A encoder and decoder for [WATSON](https://github.com/genkami/watson).

The API is similiar to [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON).

Supports Node.js > 10 or browser with similiar level of JS support.


### Examples:
```js
const WATSON = require('watson.js')
const data = { hello: 'world' }
const s = WATSON.stringify(data)

const prettified = WATSON.stringify(data, { prettify: true })
const SFirst = WATSON.stringify(data, { mode: 'S' })

WATSON.parse(s)
WATSON.parse(SFirst, 'S')

// unsafe parsing
// this mode tries to replace possible string operations with float instead of int
// this is because WATSON's int maps to BigInt, which is slow on most platforms
// this mode detects sadd/snew, inew and replace them with float operations
WATSON.parse(s, 'A', true)
```

#### Some notes
The implementation is now faster after most lazy evaluation code is replaced with eager evaluations.
Any improvements are still welcome.

#### Benchmark because why not
```
stringify x 55,492 ops/sec ±2.63% (77 runs sampled)
parse x 51,515 ops/sec ±2.52% (80 runs sampled)
parse unsafe x 54,400 ops/sec ±2.51% (74 runs sampled)
```