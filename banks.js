/* ============================================================
   banks.js — shared content bank for ratio / sharing sheets
   ------------------------------------------------------------
   Loaded as a CLASSIC script tag (not a module, not fetch).
   This means it works when the sheet is:
     - double-clicked from disk (file://)
     - emailed as a folder
     - served from a school server
     - served from GitHub Pages
   A .json file would only work in the last two.

   Design notes
   ------------
   * Names are a flat list. They carry no metadata — a name is
     a name. The generator decides who gets which share.

   * Items are COUNTABLE things. Each one declares the range of
     totals that sound natural in a sharing question, and an
     optional step so that odd quantities (31 eggs) don't slip
     through. Grand pianos simply never appear here — they're
     not unshareable, they're implausible at every quantity,
     so the schema filters them out before generation rather
     than flagging them after.

   * Currency is handled SEPARATELY. Money isn't a countable
     object — you don't share "20 pounds", you share a sum and
     the answer is "£8 and £12". Keeping it apart lets the
     generator use the right grammar and the right formatting.

   * There is no `shareable` flag. Once min/max/step are doing
     their job, anything that would need it has been excluded
     by construction.

   How to extend
   -------------
   * Add a name: append a string to `names`. Anywhere.
   * Add an item: append an object to `items`. One line if you
     skip the optional `step`.
   * Add a currency: append to `currency`. The `step` field is
     where you'd use 0.05 for a sheet that wants pence, or
     5 for one that prefers round fives.

   Nothing in this file should ever be clever. Data only.
   ============================================================ */

window.BANKS = {

  /* ----------------------------------------------------------
     NAMES
     A flat list. Mix of origins, genders and lengths so the
     stories don't all read the same. Compound names are fine
     ("Mohammed Ali") but keep them rare — long names crowd
     the question prompt.
     ---------------------------------------------------------- */
  names: [
    // From the sample PDF
    'Leo', 'Felix', 'Clara', 'Zoe', 'Wyatt', 'Levi', 'Ruby',
    'Eleanor', 'Maya', 'Sebastian',

    // Common UK names
    'Amelia', 'Oliver', 'Isla', 'Harry', 'Freya', 'Jack',
    'Evie', 'Charlie', 'Sophie', 'George', 'Grace', 'Alfie',
    'Willow', 'Archie', 'Ivy', 'Freddie', 'Rosie', 'Theo',
    'Erin', 'Lucas', 'Poppy', 'Oscar', 'Lily', 'Henry',
    'Daisy', 'Max', 'Florence', 'Toby', 'Martha', 'Finn',

    // Names with a wider reach
    'Aisha', 'Omar', 'Priya', 'Ravi', 'Mei', 'Kai', 'Nadia',
    'Yusuf', 'Anya', 'Diego', 'Sofia', 'Mateo', 'Leila',
    'Idris', 'Amara', 'Hugo', 'Marta', 'Samir', 'Elena'
  ],

  /* ----------------------------------------------------------
     ITEMS
     Countable things that can plausibly be shared.

       sing  — singular form (used when a share of 1 is possible)
       plur  — plural form (the default in prompts)
       min   — smallest sensible TOTAL. Below this the question
               reads oddly ("they share 3 sweets").
       max   — largest sensible TOTAL. Above this the numbers
               get unwieldy for mental arithmetic.
       step  — OPTIONAL. Soft preference for the total to be a
               multiple of this. The generator tries to honour
               it, but falls back to any value in range if it
               can't satisfy it without breaking the ratio.

     Rule of thumb for min/max: if you'd blink at the number in
     a Year 7 textbook, it's outside the range.
     ---------------------------------------------------------- */
  items: [
    // --- Stationery ---
    { sing: 'pencil',      plur: 'pencils',        min: 10,  max: 120 },
    { sing: 'pen',         plur: 'pens',           min:  8,  max:  80 },
    { sing: 'eraser',      plur: 'erasers',        min:  6,  max:  60 },
    { sing: 'ruler',       plur: 'rulers',         min:  6,  max:  48 },
    { sing: 'crayon',      plur: 'crayons',        min: 12,  max: 120 },
    { sing: 'marker',      plur: 'markers',        min:  8,  max:  80 },
    { sing: 'notebook',    plur: 'notebooks',      min:  6,  max:  48 },
    { sing: 'envelope',    plur: 'envelopes',      min: 20,  max: 200 },
    { sing: 'paper clip',  plur: 'paper clips',    min: 20,  max: 200 },
    { sing: 'sticker',     plur: 'stickers',       min:  8,  max: 150 },

    // --- Food and drink ---
    { sing: 'sweet',       plur: 'sweets',         min: 12,  max: 200 },
    { sing: 'chocolate',   plur: 'chocolates',     min:  8,  max:  80 },
    { sing: 'biscuit',     plur: 'biscuits',       min:  6,  max:  60 },
    { sing: 'cookie',      plur: 'cookies',        min:  6,  max:  60 },
    { sing: 'apple',       plur: 'apples',         min:  6,  max:  60 },
    { sing: 'orange',      plur: 'oranges',        min:  6,  max:  60 },
    { sing: 'grape',       plur: 'grapes',         min: 12,  max: 120 },
    { sing: 'egg',         plur: 'eggs',           min:  6,  max:  60,  step: 6 },
    { sing: 'packet of crisps', plur: 'packets of crisps', min: 6, max: 48 },

    // --- Small collectables ---
    { sing: 'marble',      plur: 'marbles',        min: 10,  max: 150 },
    { sing: 'block',       plur: 'blocks',         min:  9,  max: 120 },
    { sing: 'card',        plur: 'cards',          min: 12,  max: 100 },
    { sing: 'stamp',       plur: 'stamps',         min:  8,  max: 100 },
    { sing: 'shell',       plur: 'shells',         min:  6,  max:  80 },
    { sing: 'button',      plur: 'buttons',        min: 10,  max: 120 },
    { sing: 'bead',        plur: 'beads',          min: 12,  max: 200 },
    { sing: 'domino',      plur: 'dominoes',       min: 12,  max: 120 },
    { sing: 'counter',     plur: 'counters',       min: 12,  max: 120 },
    { sing: 'badge',       plur: 'badges',         min:  6,  max:  60 },
    { sing: 'magnet',      plur: 'magnets',        min:  6,  max:  60 },

    // --- Household and garden ---
    { sing: 'candle',      plur: 'candles',        min:  6,  max:  80 },
    { sing: 'glass',       plur: 'glasses',        min:  8,  max:  72 },
    { sing: 'disk',        plur: 'disks',          min: 12,  max:  96 },
    { sing: 'tile',        plur: 'tiles',          min: 12,  max: 120 },
    { sing: 'plant',       plur: 'plants',         min:  6,  max:  48 },
    { sing: 'flower',      plur: 'flowers',        min:  6,  max:  60 },
    { sing: 'seed',        plur: 'seeds',          min: 10,  max: 100 },
    { sing: 'balloon',     plur: 'balloons',       min:  8,  max:  80 },

    // --- Books and media ---
    { sing: 'book',        plur: 'books',          min:  6,  max:  60 },
    { sing: 'comic',       plur: 'comics',         min:  6,  max:  60 },
    { sing: 'magazine',    plur: 'magazines',      min:  6,  max:  48 }
  ],

  /* ----------------------------------------------------------
     CURRENCY
     Kept separate from items because money behaves differently:
     it's a SUM, not a count. The generator will produce prompts
     like "£20" and answers like "£8 and £12".

       symbol — written before the amount
       name   — used in prose ("a sum of money" is safer; see note)
       min    — smallest sensible total
       max    — largest sensible total
       step   — smallest unit of the total. 1 = whole units.
                0.05 = pence allowed. 5 = multiples of 5.
     ---------------------------------------------------------- */
  currency: [
    { symbol: '£', name: 'pounds',  min:  5, max: 500, step: 1 },
    { symbol: '$', name: 'dollars', min:  5, max: 500, step: 1 },
    { symbol: '€', name: 'euros',   min:  5, max: 500, step: 1 }
  ]
};