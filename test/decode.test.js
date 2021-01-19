const tap = require('tap')
const d = require('../lib/decode')

tap.strictSame(
  d.parse(
    `~?ShaaaaaarrShaaaaarrkShaaarrk-
    SameeShaaaaaarrShaaaaarrkShaarrkShrrk-
    ShaaaaaarrShaaaaakSameeShaaarrkShaarrk-
    ShaaaaaarrShaaaaarrkShaaarrkShaarrk-
    ShaaaaaarrShaaaaarrkShaaarrkShaarrkSharrkShrrk-$
    BubbbbbbBubbbbbaBubbbbaBubbaBubaBua!
    BubbbbbbBubbbbbaBubbbaBubbaBubaBua!
    BubbbbbbBubbbbbaBubbbbaBuba!
    BubbbbbbBubbbbbaBubbbaBubba!
    BubbbbbbBubbbbbaBubba!M?
    ShaaaaaaShaaaaakShaakShak-
    ShaaaaaaShaaaaakShaaakShk-
    ShaaaaaaShaaaaakShaaaakShak-
    ShaaaaaaShaaaaakShaaaakShakShk-
    ShaaaaaaShaaaaakShaaaakShaak-
    ^!!!!!!!!!!!!!g`
  ),
  {
    first: true,
    hello: 'world'
  },
  'hello.watson'
)

tap.strictSame(
  d.parse(
    `~?ShaaaaaarrShaaaaarrkShaaarrk-
    SameeShaaaaaarrShaaaaarrkShaarrkShrrk-
    ShaaaaaarrShaaaaakSameeShaaarrkShaarrk-
    ShaaaaaarrShaaaaarrkShaaarrkShaarrk-
    ShaaaaaarrShaaaaarrkShaaarrkShaarrkSharrkShrrk-$
    BubbbbbbBubbbbbaBubbbbaBubbaBubaBua!
    BubbbbbbBubbbbbaBubbbaBubbaBubaBua!
    BubbbbbbBubbbbbaBubbbbaBuba!
    BubbbbbbBubbbbbaBubbbaBubba!
    BubbbbbbBubbbbbaBubba!M?
    ShaaaaaaShaaaaakShaakShak-
    ShaaaaaaShaaaaakShaaakShk-
    ShaaaaaaShaaaaakShaaaakShak-
    ShaaaaaaShaaaaakShaaaakShakShk-
    ShaaaaaaShaaaaakShaaaakShaak-
    ^!!!!!!!!!!!!!g`,
    'A',
    true
  ),
  {
    first: true,
    hello: 'world'
  },
  'hello.watson in unsafe mode'
)
