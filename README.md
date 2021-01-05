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
```

#### Some notes
Currently the implementation is quite slow (especially parsing WATSON).
Ideas for improvements are appreciated.

#### Benchmark because why not
```
stringify x 40,315 ops/sec ±2.70% (77 runs sampled)
parse x 31,466 ops/sec ±2.61% (81 runs sampled)
```