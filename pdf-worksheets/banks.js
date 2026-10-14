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
  ],

  /* ----------------------------------------------------------
     PROPORTION
     Content bank for the Direct Proportion worksheet generator.

     Markup inside `stem`:
       `x`         → x renders in italic
       \frac{a}{b} → a/b renders as a stacked fraction

     Field meanings:
       id            — stable identifier, used in the seed and
                       in duplicate-detection keys.
       stem          — the opening sentence(s) of the question.
       Asym, Bsym    — the two quantities, in the form they
                       appear in answers ("`m` = 4`l`").
       k             — [min,max] range for the constant of
                       proportionality.  Higher GCSE runs larger
                       numbers than the Foundation set.
       B0            — [min,max] for the given B value.
       B1, B2        — [min,max] for the two test B values.
       fracAllowed   — when true, ~20% of this context's
                       questions use a fractional constant
                       (proper fractions only).  When false,
                       k is always an integer.

     Currency contexts (ribbon, pay, ticket, currency) hard-code
     £ in the stem.  The toolbar's currency selector does not
     affect these; it only affects the rate and best-value
     archetypes.
     ---------------------------------------------------------- */
  proportion: {

    /* ------------------------------------------------------
       CONTEXTS — Foundation set
       The original seven.  Kept first so nothing reorders.
       ------------------------------------------------------ */
    contexts: [
      { id:'pipe',    fracAllowed: true,
        stem:'The mass, `m` kg, of a length of pipe is directly proportional to its length, `l` m.',
        Asym:'m', Bsym:'l', k:[2,12], B0:[2,9],  B1:[2,12], B2:[2,12] },
      { id:'tap',     fracAllowed: false,
        stem:'The volume, `V` litres, of water that comes out of a tap is directly proportional to the time, `T` minutes, for which the tap is turned on.',
        Asym:'V', Bsym:'T', k:[10,60], B0:[2,6], B1:[2,8],  B2:[2,8] },
      { id:'paint',   fracAllowed: true,
        stem:'The quantity, `P` litres, of paint needed to cover a wall is directly proportional to the area, `A` m\u00B2, of the wall.',
        Asym:'P', Bsym:'A', k:[2,5],  B0:[4,12], B1:[4,15], B2:[4,15] },
      { id:'shadow',  fracAllowed: true,
        stem:'The length, `L` m, of a shadow is directly proportional to the height, `H` m, of the object casting it.',
        Asym:'L', Bsym:'H', k:[2,8],  B0:[2,8],  B1:[2,10], B2:[2,10] },
      { id:'current', fracAllowed: false,
        stem:'The electric current, `I` amps, in a lamp is directly proportional to the voltage, `V` volts.',
        Asym:'I', Bsym:'V', k:[2,8],  B0:[2,8],  B1:[2,10], B2:[2,10] },
      { id:'spring',  fracAllowed: true,
        stem:'The extension, `e` cm, of a spring is directly proportional to the force, `F` newtons, applied to it.',
        Asym:'e', Bsym:'F', k:[2,8],  B0:[2,8],  B1:[2,10], B2:[2,10] },
      { id:'flour',   fracAllowed: false,
        stem:'The mass, `m` g, of flour needed for a recipe is directly proportional to the number of people, `n`, the recipe is for.',
        Asym:'m', Bsym:'n', k:[30,90], B0:[2,8], B1:[2,10], B2:[2,10] },

      /* --------------------------------------------------
         CONTEXTS — GCSE Higher set
         Twenty additional contexts.  Numbers run larger
         than the Foundation set.  Fractional constants are
         enabled where they read naturally.
         -------------------------------------------------- */

      /* --- physics / kinematics --- */
      { id:'car', fracAllowed: false,
        stem:'The distance, `d` km, that a car travels is directly proportional to the time, `t` hours, for which it has been driving at a constant speed.',
        Asym:'d', Bsym:'t', k:[40,90], B0:[1,4], B1:[1,6], B2:[1,6] },

      /* --- money / consumer --- */
      { id:'ribbon', fracAllowed: true,
        stem:'The cost, £`c`, of a length of ribbon is directly proportional to its length, `l` metres.',
        Asym:'c', Bsym:'l', k:[1,5], B0:[2,8], B1:[2,10], B2:[2,10] },

      { id:'pay', fracAllowed: false,
        stem:'The amount earned, £`E`, is directly proportional to the number of hours, `h`, worked.',
        Asym:'E', Bsym:'h', k:[8,20], B0:[5,15], B1:[5,20], B2:[5,20] },

      { id:'ticket', fracAllowed: false,
        stem:'The total cost, £`C`, of concert tickets is directly proportional to the number of tickets, `n`, bought.',
        Asym:'C', Bsym:'n', k:[15,80], B0:[2,8], B1:[2,10], B2:[2,10] },

      { id:'currency', fracAllowed: true,
        stem:'The number of euros, `E`, that you receive is directly proportional to the number of pounds, `P`, that you exchange.',
        Asym:'E', Bsym:'P', k:[1,3], B0:[20,200], B1:[20,300], B2:[20,300] },

      /* --- construction / measurement --- */
      { id:'bricks', fracAllowed: false,
        stem:'The number of bricks, `n`, needed to build a wall is directly proportional to the length, `l` metres, of the wall.',
        Asym:'n', Bsym:'l', k:[50,90], B0:[3,10], B1:[3,12], B2:[3,12] },

      { id:'tiles', fracAllowed: false,
        stem:'The number of tiles, `n`, needed to cover a floor is directly proportional to the area, `A` m\u00B2, of the floor.',
        Asym:'n', Bsym:'A', k:[10,20], B0:[4,15], B1:[4,18], B2:[4,18] },

      { id:'map', fracAllowed: true,
        stem:'The actual distance, `D` km, represented on a map is directly proportional to the distance, `d` cm, measured on the map.',
        Asym:'D', Bsym:'d', k:[1,5], B0:[3,10], B1:[3,12], B2:[3,12] },

      /* --- physics / materials --- */
      { id:'block', fracAllowed: true,
        stem:'The mass, `m` grams, of a solid block of material is directly proportional to its volume, `V` cm\u00B3.',
        Asym:'m', Bsym:'V', k:[2,10], B0:[20,200], B1:[20,300], B2:[20,300] },

      { id:'wire', fracAllowed: true,
        stem:'The resistance, `R` ohms, of a wire is directly proportional to its length, `l` metres.',
        Asym:'R', Bsym:'l', k:[1,8], B0:[2,15], B1:[2,20], B2:[2,20] },

      { id:'pressure', fracAllowed: false,
        stem:'The pressure, `P` kPa, on an object below the surface of the sea is directly proportional to its depth, `d` metres.',
        Asym:'P', Bsym:'d', k:[5,15], B0:[2,10], B1:[2,15], B2:[2,15] },

      /* --- mechanical / digital --- */
      { id:'copier', fracAllowed: false,
        stem:'The number of pages, `n`, that a photocopier can print is directly proportional to the time, `t` minutes, for which it is running.',
        Asym:'n', Bsym:'t', k:[15,40], B0:[2,10], B1:[2,15], B2:[2,15] },

      { id:'stream', fracAllowed: false,
        stem:'The amount of data, `D` MB, used is directly proportional to the time, `t` minutes, spent streaming.',
        Asym:'D', Bsym:'t', k:[3,15], B0:[10,60], B1:[10,90], B2:[10,90] },

      { id:'typing', fracAllowed: false,
        stem:'The number of words, `n`, that a typist can type is directly proportional to the time, `t` minutes, spent typing at a steady rate.',
        Asym:'n', Bsym:'t', k:[30,90], B0:[3,15], B1:[3,20], B2:[3,20] },

      /* --- craft / everyday --- */
      { id:'necklace', fracAllowed: true,
        stem:'The length, `L` cm, of a necklace is directly proportional to the number of beads, `n`, that it contains.',
        Asym:'L', Bsym:'n', k:[1,3], B0:[10,40], B1:[10,50], B2:[10,50] },

      { id:'paper', fracAllowed: true,
        stem:'The mass, `m` grams, of a stack of paper is directly proportional to the number of sheets, `n`, in the stack.',
        Asym:'m', Bsym:'n', k:[3,8], B0:[50,200], B1:[50,250], B2:[50,250] },

      { id:'cylinder', fracAllowed: true,
        stem:'The volume, `V` cm\u00B3, of water in a cylindrical jar is directly proportional to the height, `h` cm, of the water.',
        Asym:'V', Bsym:'h', k:[10,50], B0:[5,20], B1:[5,25], B2:[5,25] },

      { id:'candle', fracAllowed: false,
        stem:'The amount, `h` cm, by which a candle has shortened is directly proportional to the time, `t` hours, for which it has been burning.',
        Asym:'h', Bsym:'t', k:[1,4], B0:[1,5], B1:[1,8], B2:[1,8] },

      /* --- transport / fuel --- */
      { id:'fuel', fracAllowed: false,
        stem:'The distance, `d` km, that a van can travel is directly proportional to the amount of fuel, `V` litres, that it uses.',
        Asym:'d', Bsym:'V', k:[8,20], B0:[5,40], B1:[5,50], B2:[5,50] },

      /* --- food / cooking --- */
      { id:'cooking', fracAllowed: false,
        stem:'The cooking time, `T` minutes, for a joint of meat is directly proportional to its mass, `m` kilograms.',
        Asym:'T', Bsym:'m', k:[15,40], B0:[1,4], B1:[1,5], B2:[1,5] }
    ],

    /* ------------------------------------------------------
       RATES
       Used by the unit-rate and best-value archetypes.
       Each entry is a shop item sold by weight or volume.

         noun — what is being sold
         unit — ml, g, etc.
       ------------------------------------------------------ */
    rates: [
      { noun:'olive oil',     unit:'ml' },
      { noun:'sunflower oil', unit:'ml' },
      { noun:'orange juice',  unit:'ml' },
      { noun:'honey',         unit:'g'  },
      { noun:'flour',         unit:'g'  },
      { noun:'rice',          unit:'g'  },
      { noun:'coffee beans',  unit:'g'  }
    ]
  },

  /* ----------------------------------------------------------
     RECIPES
     Content bank for the recipe-scaling and recipe archetypes.

     Each dish:
       name        — used in prose ("apple crumble")
       servesPool  — base serving sizes to draw from. All must
                     divide by at least one k in [2..6] with
                     servesN/k >= 2, so part (b) works.
       ingredients — ordered list. Each has:
                       name  — singular, as it appears in the box
                       unit  — 'g' or 'ml' (never empty)
                       pool  — amounts to draw from

     All amounts are whole numbers. The generator filters the
     pool for the "divide" ingredient at generation time, so
     a pool doesn't need to be uniformly divisible — it just
     needs at least one divisible value for each possible k.

     To add a dish: copy any block below and edit. Nothing
     else in banks.js needs to change.
     ---------------------------------------------------------- */
  recipes: {
    dishes: [
      {
        name: 'apple crumble',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'apple',  unit: 'g', pool: [400, 500, 600, 700, 800] },
          { name: 'sugar',  unit: 'g', pool: [100, 150, 200, 250, 300] },
          { name: 'flour',  unit: 'g', pool: [120, 180, 240, 300, 360, 420] },
          { name: 'butter', unit: 'g', pool: [ 20,  30,  40,  60,  80, 100, 120, 150, 180, 240, 300] }
        ]
      },
      {
        name: 'fruit cake',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'mixed fruit', unit: 'g', pool: [200, 300, 400, 500] },
          { name: 'flour',       unit: 'g', pool: [150, 180, 240, 300] },
          { name: 'butter',      unit: 'g', pool: [100, 120, 150, 200, 240] },
          { name: 'sugar',       unit: 'g', pool: [ 80, 100, 120, 160, 200] }
        ]
      },
      {
        name: 'chocolate brownie',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'chocolate', unit: 'g', pool: [100, 150, 200, 250, 300] },
          { name: 'butter',    unit: 'g', pool: [100, 120, 150, 200, 250] },
          { name: 'sugar',     unit: 'g', pool: [150, 200, 240, 300] },
          { name: 'flour',     unit: 'g', pool: [ 80, 100, 120, 160, 200] }
        ]
      },
      {
        name: 'banana bread',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'banana', unit: 'g', pool: [200, 250, 300, 350, 400] },
          { name: 'sugar',  unit: 'g', pool: [100, 120, 150, 180, 200] },
          { name: 'flour',  unit: 'g', pool: [180, 240, 300, 360] },
          { name: 'butter', unit: 'g', pool: [ 80, 100, 120, 150, 180] }
        ]
      },
      {
        name: 'lemon drizzle',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'lemon',  unit: 'g', pool: [ 50,  80, 100, 120, 150] },
          { name: 'sugar',  unit: 'g', pool: [150, 180, 200, 240, 300] },
          { name: 'flour',  unit: 'g', pool: [180, 240, 300, 360] },
          { name: 'butter', unit: 'g', pool: [100, 120, 150, 180, 200] }
        ]
      },
      {
        name: 'flapjack',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'oats',   unit: 'g', pool: [200, 250, 300, 400] },
          { name: 'butter', unit: 'g', pool: [100, 120, 150, 200] },
          { name: 'syrup',  unit: 'g', pool: [ 80, 100, 120, 150] },
          { name: 'sugar',  unit: 'g', pool: [ 60,  80, 100, 120] }
        ]
      },
      {
        name: 'shortbread',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'flour',     unit: 'g', pool: [180, 240, 300, 360] },
          { name: 'butter',    unit: 'g', pool: [120, 150, 180, 240] },
          { name: 'sugar',     unit: 'g', pool: [ 60,  80, 100, 120] },
          { name: 'cornflour', unit: 'g', pool: [ 40,  60,  80, 100] }
        ]
      },
      {
        name: 'scone',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g',  pool: [250, 300, 400, 500] },
          { name: 'butter', unit: 'g',  pool: [ 50,  60,  80, 100] },
          { name: 'milk',   unit: 'ml', pool: [100, 120, 150, 200] },
          { name: 'sugar',  unit: 'g',  pool: [ 30,  40,  50,  60] }
        ]
      },
      {
        name: 'pancake batter',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g',  pool: [120, 150, 200, 240, 300] },
          { name: 'milk',   unit: 'ml', pool: [200, 240, 300, 400] },
          { name: 'butter', unit: 'g',  pool: [ 30,  40,  50,  60] },
          { name: 'sugar',  unit: 'g',  pool: [ 20,  30,  40,  50] }
        ]
      },
      {
        name: 'muffin',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g',  pool: [200, 240, 300, 400] },
          { name: 'sugar',  unit: 'g',  pool: [100, 120, 150, 200] },
          { name: 'butter', unit: 'g',  pool: [ 80, 100, 120, 160] },
          { name: 'milk',   unit: 'ml', pool: [100, 120, 150, 200] }
        ]
      },
      {
        name: 'carrot cake',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'carrot', unit: 'g',  pool: [150, 200, 250, 300, 350] },
          { name: 'flour',  unit: 'g',  pool: [180, 240, 300, 360] },
          { name: 'sugar',  unit: 'g',  pool: [150, 180, 200, 240, 300] },
          { name: 'oil',    unit: 'ml', pool: [ 80, 100, 120, 160] }
        ]
      },
      {
        name: 'gingerbread',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g', pool: [200, 240, 300, 400] },
          { name: 'butter', unit: 'g', pool: [ 80, 100, 120, 160] },
          { name: 'syrup',  unit: 'g', pool: [100, 120, 150, 200] },
          { name: 'sugar',  unit: 'g', pool: [ 60,  80, 100, 120] }
        ]
      },
      {
        name: 'oat cookies',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'oats',   unit: 'g', pool: [100, 150, 200, 250] },
          { name: 'flour',  unit: 'g', pool: [100, 120, 150, 200] },
          { name: 'butter', unit: 'g', pool: [ 80, 100, 120, 160] },
          { name: 'sugar',  unit: 'g', pool: [ 60,  80, 100, 120] }
        ]
      },
      {
        name: 'victoria sponge',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g',  pool: [150, 180, 200, 240, 300] },
          { name: 'butter', unit: 'g',  pool: [150, 180, 200, 240, 300] },
          { name: 'sugar',  unit: 'g',  pool: [150, 180, 200, 240, 300] },
          { name: 'milk',   unit: 'ml', pool: [ 50,  80, 100, 120, 150] }
        ]
      },
      {
        name: 'rock cakes',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g', pool: [250, 300, 400, 500] },
          { name: 'butter', unit: 'g', pool: [ 80, 100, 120, 160] },
          { name: 'sugar',  unit: 'g', pool: [ 60,  80, 100, 120] },
          { name: 'raisin', unit: 'g', pool: [ 80, 100, 120, 160] }
        ]
      },
      {
        name: 'cheese scone',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g',  pool: [250, 300, 400, 500] },
          { name: 'butter', unit: 'g',  pool: [ 50,  60,  80, 100] },
          { name: 'cheese', unit: 'g',  pool: [ 80, 100, 120, 160] },
          { name: 'milk',   unit: 'ml', pool: [100, 120, 150, 200] }
        ]
      },
      {
        name: 'pizza dough',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'flour', unit: 'g',  pool: [250, 300, 400, 500] },
          { name: 'water', unit: 'ml', pool: [150, 200, 240, 300] },
          { name: 'oil',   unit: 'ml', pool: [ 30,  40,  50,  60] },
          { name: 'sugar', unit: 'g',  pool: [ 10,  20,  30,  40] }
        ]
      },
      {
        name: 'bread rolls',
        servesPool: [6, 8, 10, 12],
        ingredients: [
          { name: 'flour', unit: 'g',  pool: [400, 500, 600, 800] },
          { name: 'water', unit: 'ml', pool: [250, 300, 350, 450] },
          { name: 'oil',   unit: 'ml', pool: [ 30,  40,  50,  70] },
          { name: 'sugar', unit: 'g',  pool: [ 20,  30,  40,  50] }
        ]
      },
      {
        name: 'crumble topping',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'flour',  unit: 'g', pool: [100, 120, 150, 200] },
          { name: 'butter', unit: 'g', pool: [ 60,  80, 100, 120] },
          { name: 'sugar',  unit: 'g', pool: [ 60,  80, 100, 120] },
          { name: 'oats',   unit: 'g', pool: [ 60,  80, 100, 120] }
        ]
      },
      {
        name: 'rice pudding',
        servesPool: [4, 6, 8, 10, 12],
        ingredients: [
          { name: 'rice',   unit: 'g',  pool: [ 80, 100, 120, 160] },
          { name: 'milk',   unit: 'ml', pool: [400, 500, 600, 800] },
          { name: 'sugar',  unit: 'g',  pool: [ 40,  50,  60,  80] },
          { name: 'butter', unit: 'g',  pool: [ 30,  40,  50,  60] }
        ]
      }
    ]
  }
};

/* ============================================================
   BOUNDS (limits of accuracy) — data pools
   ============================================================ */
window.BANKS = window.BANKS || {};
window.BANKS.bounds = {

  /* ---- Simple rounded measurements (whole-number / 5 / 10 /
     50 / 100 roundings).  Used by 'bounds-simple'. */
  simple: {
    roundings: [
      { u: 1,   d: 'the nearest whole number' },
      { u: 10,  d: 'the nearest 10' },
      { u: 100, d: 'the nearest 100' },
      { u: 5,   d: 'the nearest 5' },
      { u: 50,  d: 'the nearest 50' }
    ],
    /* Each unit carries a pool of values sensible at that scale.
       The topic filters each pool to those divisible by the
       chosen rounding. */
    units: [
      { u: 'cm', pool: [20, 40, 60, 80, 100, 200, 300, 500, 600] },
      { u: 'm',  pool: [50, 100, 200, 300, 500, 800, 1000, 5000] },
      { u: 'g',  pool: [100, 200, 300, 500, 800, 1000, 5000] },
      { u: 'kg', pool: [2, 4, 6, 10, 20, 30, 50, 80] },
      { u: 'ml', pool: [100, 200, 300, 500, 800, 1000] }
    ]
  },

  /* ---- Measurements rounded to significant figures.
     Used by 'bounds-sf'.  Values chosen so both 1 s.f. and 2 s.f.
     interpretations are sensible. */
  sigFigs: {
    units: [
      { u: 'm',  pool: [3, 8, 20, 60, 80, 200, 400] },
      { u: 'cm', pool: [4, 7, 30, 50, 90, 100, 600] },
      { u: 'g',  pool: [7, 50, 80, 200, 400, 900] },
      { u: 'mg', pool: [4, 6, 30, 80] },
      { u: 'km', pool: [3, 8, 20, 60, 90] },
      { u: 'ml', pool: [24, 36, 48, 82, 360, 800] },
      { u: 'kg', pool: [0.83, 0.42, 0.65, 0.14, 3.6, 8.9] }
    ]
  },

  /* ---- Contextual word problems.  Used by 'bounds-context'.
     Each array is a family of contexts the topic can pick from;
     add more entries to the array to introduce further variants
     of the same shape.  The topic itself holds the template. */
  contexts: {

    /* (a) "N identical containers"; bounds on the total. */
    containers: [
      { noun: 'pot of paint', unit: 'ml',
        sizes:    [200, 300, 400, 500, 800],
        roundings: [10, 20, 50, 100],
        counts:   [3, 4, 5, 6, 8, 10] },
      { noun: 'bottle of water', unit: 'ml',
        sizes:    [250, 500, 750, 1000, 1500],
        roundings: [10, 25, 50, 100],
        counts:   [2, 3, 4, 5, 6] },
      { noun: 'tin of beans', unit: 'g',
        sizes:    [200, 300, 400, 500],
        roundings: [10, 20, 50, 100],
        counts:   [3, 4, 5, 6] }
    ],

    /* (b) Daily distance over a week; least possible total. */
    runners: [
      { distanceUnit: 'km',
        distances: [4, 5, 6, 7, 8, 9, 10, 12],
        days: 7 },
      { distanceUnit: 'miles',
        distances: [2, 3, 4, 5, 6, 8, 10],
        days: 7 }
    ],

    /* (c) Bag of flour vs recipe target; yes/no on "definitely
       enough". */
    bags: [
      { noun: 'bag of flour', unit: 'g',
        sizes:    [200, 250, 300, 400, 500],
        roundings: [5, 10, 20, 25, 50],
        counts:   [3, 4, 5, 6],
        targets:  [600, 700, 740, 800, 1000, 1200, 1500] },
      { noun: 'packet of sugar', unit: 'g',
        sizes:    [250, 500, 750, 1000],
        roundings: [10, 25, 50, 100],
        counts:   [2, 3, 4, 5],
        targets:  [1500, 2000, 2500, 3000, 4000] }
    ],

    /* (d) Bookshelf — max count that will definitely fit. */
    books: [
      { noun: 'paperback book',
        thicknessUnit: 'cm',
        thicknesses: [1.5, 1.8, 2.2, 2.4, 2.5, 2.6, 3.2, 3.5],
        thicknessRounding: 0.1,
        shelfUnit: 'm',
        shelves: [0.80, 0.90, 1.00, 1.10, 1.20, 1.30, 1.40, 1.50],
        shelfRounding: 0.01,
        count: 50 }
    ]
  },

  /* ---- Rectangle perimeter & area.  Used by
     'bounds-area-perimeter'. */
  rectangles: {
    lengths: [30, 40, 50, 60, 80, 100, 120],
    widths:  [10, 15, 20, 25, 30, 40, 50],
    roundings: [
      { u: 1,  d: '1 m' },
      { u: 5,  d: '5 m' },
      { u: 10, d: '10 m' }
    ]
  }
};

/* ============================================================
   STANDARD FORM — real-world comparison data
   ------------------------------------------------------------
   Used by the 'std-form-compare' topic. Each category holds
   a list of named quantities that share a unit, so any two
   entries can be meaningfully compared as a ratio.

   Accuracy notes:
     • Country areas, planet data, building heights, ocean
       depths and mountain heights are stable reference
       figures and can be treated as exact for worksheet use.
     • Country populations carry a `year` field. They drift
       and should be re-checked periodically.
     • Animal masses and speeds are approximate species
       averages and vary by individual and by source.
     • River lengths vary by source; the figures below use
       the most commonly cited measurements.
   ============================================================ */
window.BANKS = window.BANKS || {};
window.BANKS.standardForm = {
  categories: [

    /* ---- Country areas, km² (CIA World Factbook) ---- */
    {
      id: 'country-area',
      noun: 'area',
      unit: 'km\u00B2',
      entries: [
        { name: 'Russia',        value: 17098242 },
        { name: 'Canada',        value:  9984670 },
        { name: 'USA',           value:  9833517 },
        { name: 'China',         value:  9596960 },
        { name: 'Brazil',        value:  8515770 },
        { name: 'Australia',     value:  7692024 },
        { name: 'India',         value:  3287263 },
        { name: 'Argentina',     value:  2780400 },
        { name: 'Kazakhstan',    value:  2724900 },
        { name: 'Algeria',       value:  2381741 },
        { name: 'DR Congo',      value:  2344858 },
        { name: 'Saudi Arabia',  value:  2149690 },
        { name: 'Mexico',        value:  1964375 },
        { name: 'Indonesia',     value:  1904569 },
        { name: 'Iran',          value:  1648195 },
        { name: 'Mongolia',      value:  1564110 },
        { name: 'Peru',          value:  1285216 },
        { name: 'Egypt',         value:  1001450 },
        { name: 'Nigeria',       value:   923768 },
        { name: 'Pakistan',      value:   796095 },
        { name: 'Turkey',        value:   783562 },
        { name: 'France',        value:   551695 },
        { name: 'Thailand',      value:   513120 },
        { name: 'Spain',         value:   505370 },
        { name: 'Sweden',        value:   450295 },
        { name: 'Japan',         value:   377915 },
        { name: 'Germany',       value:   357022 },
        { name: 'Italy',         value:   301340 },
        { name: 'New Zealand',   value:   268838 },
        { name: 'UK',            value:   243610 },
        { name: 'Greece',        value:   131957 },
        { name: 'Iceland',       value:   103000 },
        { name: 'Portugal',      value:    92090 },
        { name: 'Ireland',       value:    70273 },
        { name: 'Switzerland',   value:    41277 },
        { name: 'Belgium',       value:    30528 },
        { name: 'Cyprus',        value:     9251 },
        { name: 'Luxembourg',    value:     2586 },
        { name: 'Singapore',     value:      719 },
        { name: 'Malta',         value:      316 },
        { name: 'Monaco',        value:     2.02 }
      ]
    },

    /* ---- Country populations, 2024 UN estimates ---- */
    {
      id: 'country-population',
      noun: 'population',
      unit: '',
      year: 2024,
      entries: [
        { name: 'India',         value: 1441719852 },
        { name: 'China',         value: 1425178782 },
        { name: 'USA',           value:  341814420 },
        { name: 'Indonesia',     value:  279798049 },
        { name: 'Pakistan',      value:  245209815 },
        { name: 'Nigeria',       value:  229152217 },
        { name: 'Brazil',        value:  217637297 },
        { name: 'Bangladesh',    value:  174701211 },
        { name: 'Russia',        value:  144820423 },
        { name: 'Ethiopia',      value:  129719719 },
        { name: 'Mexico',        value:  129388467 },
        { name: 'Japan',         value:  123753041 },
        { name: 'Philippines',   value:  119106224 },
        { name: 'Egypt',         value:  114535772 },
        { name: 'DR Congo',      value:  105789731 },
        { name: 'Vietnam',       value:  100987686 },
        { name: 'Iran',          value:   89809780 },
        { name: 'Turkey',        value:   87473805 },
        { name: 'Germany',       value:   84552242 },
        { name: 'Thailand',      value:   71885799 },
        { name: 'UK',            value:   68459055 },
        { name: 'France',        value:   64756584 },
        { name: 'Tanzania',      value:   67462121 },
        { name: 'South Africa',  value:   61020221 },
        { name: 'Italy',         value:   58697744 },
        { name: 'Myanmar',       value:   54964694 },
        { name: 'Kenya',         value:   56432944 },
        { name: 'South Korea',   value:   51741963 },
        { name: 'Colombia',      value:   52340774 },
        { name: 'Spain',         value:   47889958 },
        { name: 'Uganda',        value:   49924252 },
        { name: 'Argentina',     value:   45851378 },
        { name: 'Algeria',       value:   46278751 },
        { name: 'Sudan',         value:   49358228 },
        { name: 'Iraq',          value:   46042015 },
        { name: 'Afghanistan',   value:   43372950 },
        { name: 'Poland',        value:   38746310 },
        { name: 'Canada',        value:   39107046 },
        { name: 'Morocco',       value:   38211459 },
        { name: 'Saudi Arabia',  value:   36544431 },
        { name: 'Uzbekistan',    value:   35673804 },
        { name: 'Peru',          value:   34683444 },
        { name: 'Angola',        value:   37202061 },
        { name: 'Malaysia',      value:   35389637 },
        { name: 'Mozambique',    value:   34858402 },
        { name: 'Ghana',         value:   34589092 },
        { name: 'Yemen',         value:   35219853 },
        { name: 'Nepal',         value:   29964614 },
        { name: 'Venezuela',     value:   28838499 },
        { name: 'Madagascar',    value:   30325732 },
        { name: 'Cameroon',      value:   29123744 },
        { name: 'Australia',     value:   26699482 },
        { name: 'Niger',         value:   27032412 }
      ]
    },

    /* ---- Planet diameters, km (NASA) ---- */
    {
      id: 'planet-diameter',
      noun: 'diameter',
      unit: 'km',
      entries: [
        { name: 'Sun',      value: 1392700 },
        { name: 'Jupiter',  value:  139820 },
        { name: 'Saturn',   value:  116460 },
        { name: 'Uranus',   value:   50724 },
        { name: 'Neptune',  value:   49244 },
        { name: 'Earth',    value:   12742 },
        { name: 'Venus',    value:   12104 },
        { name: 'Mars',     value:    6779 },
        { name: 'Mercury',  value:    4879 },
        { name: 'Moon',     value:    3475 },
        { name: 'Pluto',    value:    2377 }
      ]
    },

    /* ---- Planet masses, kg (NASA) ---- */
    {
      id: 'planet-mass',
      noun: 'mass',
      unit: 'kg',
      entries: [
        { name: 'Sun',      value: 1.989e30 },
        { name: 'Jupiter',  value: 1.898e27 },
        { name: 'Saturn',   value: 5.683e26 },
        { name: 'Neptune',  value: 1.024e26 },
        { name: 'Uranus',   value: 8.681e25 },
        { name: 'Earth',    value: 5.972e24 },
        { name: 'Venus',    value: 4.867e24 },
        { name: 'Mars',     value: 6.417e23 },
        { name: 'Mercury',  value: 3.301e23 },
        { name: 'Moon',     value: 7.342e22 }
      ]
    },

    /* ---- Planet distances from Sun, km (semi-major axis) ---- */
    {
      id: 'planet-distance',
      noun: 'distance from the Sun',
      unit: 'km',
      entries: [
        { name: 'Mercury',  value: 5.791e7 },
        { name: 'Venus',    value: 1.082e8 },
        { name: 'Earth',    value: 1.496e8 },
        { name: 'Mars',     value: 2.279e8 },
        { name: 'Jupiter',  value: 7.785e8 },
        { name: 'Saturn',   value: 1.433e9 },
        { name: 'Uranus',   value: 2.872e9 },
        { name: 'Neptune',  value: 4.495e9 },
        { name: 'Pluto',    value: 5.906e9 }
      ]
    },

    /* ---- Animal masses, kg (approximate adult averages) ---- */
    {
      id: 'animal-mass',
      noun: 'mass',
      unit: 'kg',
      entries: [
        { name: 'blue whale',        value: 150000 },
        { name: 'fin whale',         value:  70000 },
        { name: 'sperm whale',       value:  41000 },
        { name: 'humpback whale',    value:  30000 },
        { name: 'whale shark',       value:  19000 },
        { name: 'African elephant',  value:   6000 },
        { name: 'orca',              value:   6000 },
        { name: 'white rhinoceros',  value:   2300 },
        { name: 'hippopotamus',      value:   1500 },
        { name: 'giraffe',           value:   1200 },
        { name: 'great white shark', value:   1100 },
        { name: 'cow',               value:    700 },
        { name: 'horse',             value:    500 },
        { name: 'polar bear',        value:    450 },
        { name: 'grizzly bear',      value:    360 },
        { name: 'tiger',             value:    220 },
        { name: 'lion',              value:    190 },
        { name: 'dolphin',           value:    200 },
        { name: 'human',             value:     70 },
        { name: 'domestic dog',      value:     25 },
        { name: 'domestic cat',      value:      4 },
        { name: 'chicken',           value:    2.5 },
        { name: 'rabbit',            value:      2 },
        { name: 'guinea pig',        value:    0.9 },
        { name: 'squirrel',          value:    0.5 },
        { name: 'rat',               value:    0.3 },
        { name: 'mouse',             value:   0.02 },
        { name: 'honey bee',         value: 0.0001 },
        { name: 'house fly',         value: 0.000012 },
        { name: 'ant',               value: 0.000003 },
        { name: 'mosquito',          value: 0.0000025 }
      ]
    },

    /* ---- Animal speeds, km/h (approximate maximum) ---- */
    {
      id: 'animal-speed',
      noun: 'top speed',
      unit: 'km/h',
      entries: [
        { name: 'peregrine falcon (dive)', value: 389 },
        { name: 'cheetah',                 value: 112 },
        { name: 'sailfish',                value: 110 },
        { name: 'pronghorn antelope',      value:  88 },
        { name: 'springbok',               value:  88 },
        { name: 'lion',                    value:  80 },
        { name: 'blackbuck',               value:  80 },
        { name: 'marlin',                  value:  80 },
        { name: 'blue wildebeest',         value:  80 },
        { name: 'greyhound',               value:  72 },
        { name: 'jackrabbit',              value:  72 },
        { name: 'horse',                   value:  71 },
        { name: 'kangaroo',                value:  71 },
        { name: 'ostrich',                 value:  70 },
        { name: 'coyote',                  value:  65 },
        { name: 'dolphin',                 value:  60 },
        { name: 'grizzly bear',            value:  56 },
        { name: 'orca',                    value:  56 },
        { name: 'dragonfly',               value:  55 },
        { name: 'domestic cat',            value:  48 },
        { name: 'grey fox',                value:  50 },
        { name: 'Usain Bolt',              value:  45 },
        { name: 'elephant',                value:  40 },
        { name: 'great white shark',       value:  40 },
        { name: 'penguin',                 value:  35 },
        { name: 'domestic dog',            value:  40 },
        { name: 'honey bee',               value:  25 },
        { name: 'butterfly',               value:  19 },
        { name: 'human (average)',         value:  15 },
        { name: 'house fly',               value:   7 }
      ]
    },

    /* ---- Building heights, m (architectural height) ---- */
    {
      id: 'building-height',
      noun: 'height',
      unit: 'm',
      entries: [
        { name: 'Burj Khalifa',                  value: 828 },
        { name: 'Shanghai Tower',                value: 632 },
        { name: 'Abraj Al-Bait Clock Tower',     value: 601 },
        { name: 'Ping An Finance Centre',        value: 599 },
        { name: 'Lotte World Tower',             value: 555 },
        { name: 'One World Trade Center',        value: 541 },
        { name: 'Tianjin CTF Finance Centre',    value: 530 },
        { name: 'Guangzhou CTF Finance Centre',  value: 530 },
        { name: 'China Zun',                     value: 528 },
        { name: 'Taipei 101',                    value: 508 },
        { name: 'Shanghai World Financial Centre', value: 492 },
        { name: 'International Commerce Centre', value: 484 },
        { name: 'Petronas Towers',               value: 452 },
        { name: 'Willis Tower',                  value: 442 },
        { name: 'KK100',                         value: 442 },
        { name: 'Guangzhou International Finance Centre', value: 439 },
        { name: 'Jin Mao Tower',                 value: 421 },
        { name: 'Two International Finance Centre', value: 412 },
        { name: 'CITIC Plaza',                   value: 391 },
        { name: 'Shun Hing Square',              value: 384 },
        { name: 'Empire State Building',         value: 381 },
        { name: 'Central Plaza',                 value: 374 },
        { name: 'Bank of China Tower',           value: 367 },
        { name: 'Emirates Tower One',            value: 355 },
        { name: 'Eiffel Tower',                  value: 330 },
        { name: 'Burj Al Arab',                  value: 321 },
        { name: 'Chrysler Building',             value: 319 },
        { name: 'The Shard',                     value: 310 },
        { name: 'U.S. Bank Tower',               value: 310 },
        { name: 'Sydney Tower',                  value: 305 },
        { name: 'Eureka Tower',                  value: 297 },
        { name: 'Great Pyramid of Giza',         value: 138, note: 'original height 146 m' },
        { name: 'Blackpool Tower',               value: 158 },
        { name: 'Big Ben (Elizabeth Tower)',     value:  96 },
        { name: 'Statue of Liberty',             value:  93, note: 'including pedestal' },
        { name: 'Leaning Tower of Pisa',         value:  56 },
        { name: "Nelson's Column",               value:  52 },
        { name: 'Angel of the North',            value:  20 }
      ]
    },

    /* ---- River lengths, km (commonly cited figures) ---- */
    {
      id: 'river-length',
      noun: 'length',
      unit: 'km',
      entries: [
        { name: 'Nile',                 value: 6650 },
        { name: 'Amazon',               value: 6400 },
        { name: 'Yangtze',              value: 6300 },
        { name: 'Mississippi-Missouri', value: 6275 },
        { name: 'Yenisei',              value: 5539 },
        { name: 'Yellow River',         value: 5464 },
        { name: 'Ob-Irtysh',            value: 5410 },
        { name: 'Congo',                value: 4700 },
        { name: 'Amur',                 value: 4444 },
        { name: 'Lena',                 value: 4400 },
        { name: 'Mekong',               value: 4350 },
        { name: 'Mackenzie',            value: 4241 },
        { name: 'Niger',                value: 4200 },
        { name: 'Volga',                value: 3531 },
        { name: 'Indus',                value: 3180 },
        { name: 'Rio Grande',           value: 3051 },
        { name: 'Danube',               value: 2850 },
        { name: 'Euphrates',            value: 2800 },
        { name: 'Zambezi',              value: 2574 },
        { name: 'Ganges',               value: 2525 },
        { name: 'Colorado',             value: 2330 },
        { name: 'Rhine',                value: 1230 },
        { name: 'Elbe',                 value: 1091 },
        { name: 'Loire',                value: 1012 },
        { name: 'Seine',                value:  775 },
        { name: 'Thames',               value:  346 }
      ]
    },

    /* ---- Ocean depths, m ---- */
    {
      id: 'ocean-depth',
      noun: 'depth',
      unit: 'm',
      entries: [
        { name: 'Mariana Trench (Challenger Deep)', value: 10935, note: 'older sources say 10,994' },
        { name: 'Tonga Trench',                     value: 10882 },
        { name: 'Kuril-Kamchatka Trench',           value: 10542 },
        { name: 'Philippine Trench',                value: 10540 },
        { name: 'Kermadec Trench',                  value: 10047 },
        { name: 'Izu-Ogasawara Trench',             value:  9780 },
        { name: 'Puerto Rico Trench',               value:  8376 },
        { name: 'Peru-Chile Trench',                value:  8065 },
        { name: 'Japan Trench',                     value:  8046 },
        { name: 'Aleutian Trench',                  value:  7679 },
        { name: 'Sunda Trench',                     value:  7290 },
        { name: 'Middle America Trench',            value:  6669 },
        { name: 'average ocean depth',              value:  3688 }
      ]
    },

    /* ---- Mountain heights, m (above sea level) ---- */
    {
      id: 'mountain-height',
      noun: 'height',
      unit: 'm',
      entries: [
        { name: 'Mount Everest',    value: 8849 },
        { name: 'K2',               value: 8611 },
        { name: 'Kangchenjunga',    value: 8586 },
        { name: 'Lhotse',           value: 8516 },
        { name: 'Makalu',           value: 8485 },
        { name: 'Cho Oyu',          value: 8188 },
        { name: 'Dhaulagiri I',     value: 8167 },
        { name: 'Manaslu',          value: 8163 },
        { name: 'Nanga Parbat',     value: 8126 },
        { name: 'Annapurna I',      value: 8091 },
        { name: 'Gasherbrum I',     value: 8080 },
        { name: 'Broad Peak',       value: 8051 },
        { name: 'Gasherbrum II',    value: 8035 },
        { name: 'Shishapangma',     value: 8027 },
        { name: 'Aconcagua',        value: 6961 },
        { name: 'Denali',           value: 6190 },
        { name: 'Kilimanjaro',      value: 5895 },
        { name: 'Mount Elbrus',     value: 5642 },
        { name: 'Mont Blanc',       value: 4808 },
        { name: 'Ben Nevis',        value: 1345 },
        { name: 'Snowdon',          value: 1085 },
        { name: 'Scafell Pike',     value:  978 }
      ]
    },

    /* ---- Data storage, bytes ---- */
    {
      id: 'data-storage',
      noun: 'storage capacity',
      unit: 'bytes',
      entries: [
        { name: 'floppy disk (3.5")',          value: 1440000 },
        { name: 'human genome',                value: 3200000000 },
        { name: 'CD',                          value: 700000000 },
        { name: 'DVD',                         value: 4700000000 },
        { name: 'single-layer Blu-ray',        value: 25000000000 },
        { name: 'Wikipedia (English, text)',   value: 20000000000 },
        { name: 'typical USB stick',           value: 32000000000 },
        { name: 'typical SD card',             value: 64000000000 },
        { name: 'modern phone storage',        value: 128000000000 },
        { name: '1 TB hard drive',             value: 1000000000000 },
        { name: 'Library of Congress (digital)', value: 20000000000000 },
        { name: 'human brain (estimate)',      value: 2500000000000000 },
        { name: 'total data on the Internet (2018)', value: 3.3e22, year: 2018 }
      ]
    },

    /* ---- Microscopic sizes, m ---- */
    {
      id: 'microscopic-size',
      noun: 'size',
      unit: 'm',
      entries: [
        { name: 'proton',                   value: 8.4e-16 },
        { name: 'electron',                 value: 2.8e-15 },
        { name: 'hydrogen atom',            value: 1.2e-10 },
        { name: 'uranium atom',             value: 1.75e-10 },
        { name: 'DNA width',                value: 2.5e-9 },
        { name: 'influenza virus',          value: 1.0e-7 },
        { name: 'coronavirus',              value: 1.2e-7 },
        { name: 'E. coli bacterium',        value: 2.0e-6 },
        { name: 'typical bacterium',        value: 2.0e-6 },
        { name: 'human red blood cell',     value: 8.0e-6 },
        { name: 'dust particle',            value: 1.0e-5 },
        { name: 'human hair width',         value: 7.0e-5 },
        { name: 'pollen grain',             value: 2.5e-5 },
        { name: 'human egg cell',           value: 1.2e-4 }
      ]
    },

    /* ---- Earth distances, km ---- */
    {
      id: 'earth-distance',
      noun: 'distance',
      unit: 'km',
      entries: [
        { name: 'London to Paris',              value: 344 },
        { name: 'New York to Los Angeles',      value: 3940 },
        { name: 'London to New York',           value: 5570 },
        { name: 'New York to Tokyo',            value: 10850 },
        { name: 'London to Sydney',             value: 17000 },
        { name: 'Earth circumference',          value: 40075 },
        { name: 'Earth to Moon',                value: 384400 },
        { name: 'Earth to Venus (closest)',     value: 38000000 },
        { name: 'Earth to Mars (closest)',      value: 54600000 },
        { name: 'Earth to Sun',                 value: 149600000 },
        { name: 'Earth to Mars (farthest)',     value: 401000000 },
        { name: 'Earth to Jupiter (closest)',   value: 588000000 },
        { name: 'Earth to Saturn (closest)',    value: 1200000000 },
        { name: 'Earth to Proxima Centauri',    value: 4.0e13 },
        { name: 'diameter of the Milky Way',    value: 9.5e17 }
      ]
    }

  ]
};

/* ============================================================
   REVERSE PERCENTAGES — context bank
   ------------------------------------------------------------
   Used by the 'reverse-pct' topic.  Two families of context:
   reductions (the final value is lower than the original) and
   increases (the final value is higher).

   Each family holds:
     items     — nouns to slot into the {item} / {Item} slots.
     templates — sentences with placeholders:
                   {item}  — noun, lower-case
                   {Item}  — noun, capitalised (start of sentence)
                   {pct}   — percentage change (a number)
                   {final} — final value, already money-formatted
   ============================================================ */
window.BANKS = window.BANKS || {};
window.BANKS.reversePercent = {

  decrease: {
    items: [
      'jacket', 'coat', 'pair of shoes', 'pair of trainers', 'laptop',
      'phone', 'watch', 'camera', 'bicycle', 'sofa', 'armchair', 'TV',
      'rucksack', 'hoodie', 'dress', 'desk', 'bookcase', 'guitar'
    ],
    templates: [
      'In a sale, the price of a {item} is reduced by {pct}%. The sale price is {final}. Work out the original price.',
      '{Item} is in a sale with {pct}% off. The sale price is {final}. Work out the price before the sale.',
      'The price of a {item} is reduced by {pct}% in a sale. The sale price is {final}. Work out the original price.',
      'A shop reduces the price of a {item} by {pct}%. The new price is {final}. Work out the price before the reduction.'
    ]
  },

  increase: {
    items: [
      'train ticket', 'bus fare', 'phone contract', 'gym membership',
      'insurance policy', 'season ticket', 'utility bill', 'subscription',
      'haircut', 'car service', 'repair', 'cleaning service'
    ],
    templates: [
      'The price of a {item} is increased by {pct}%. The new price is {final}. Work out the original price.',
      'A {item} rises in price by {pct}%. The new price is {final}. Work out the price before the increase.',
      'A company adds {pct}% to the price of a {item}. The new price is {final}. Work out the price before the increase.',
      'The price of a {item} goes up by {pct}%. The new price is {final}. Work out the original price.'
    ]
  }
};

/* ============================================================
   REPEATED PERCENTAGE CHANGE — content bank
   ------------------------------------------------------------
   Items that can be depreciated.  Each is chosen so that
   "X buys a {item} for £P.  Its value depreciates by R% per
   year." reads naturally for any of the principal values the
   topic can draw.  Vehicles, tech and household goods.
   ============================================================ */
window.BANKS = window.BANKS || {};
window.BANKS.repeatedPercent = {
  depreciationItems: [
    'car', 'motorbike', 'moped', 'van', 'caravan', 'boat',
    'laptop', 'phone', 'tablet', 'camera', 'television',
    'washing machine', 'dishwasher', 'sofa', 'bicycle'
  ]
};

/* ============================================================
   ITERATIVE PERCENTAGE CHANGE — content bank
   ------------------------------------------------------------
   Used by the 'pct-iteration' topic.  Generates questions of
   the form:

     "Clio plants a tree that is 2 m in height.  The height
      increases by 10% each year.  How many years will it take
      for the tree to reach a height of 4 m?"

   The pupil is expected to iterate on a calculator: apply the
   percentage multiplier repeatedly until the target is crossed.

   Each context provides:
     id         — stable identifier used in the topic key.
     startPool  — possible starting values.
     ratePool   — possible percentages (per period).
     template   — sentence with placeholders:
                    {Name}   a random pupil name
                    {start}  starting value (no units — write the
                             unit directly into the template)
                    {rate}   the percentage change (a number)
                    {target} the threshold to cross

   Templates should read naturally for any (start, rate, target)
   triple the generator can produce from the matching pools.
   ============================================================ */
window.BANKS = window.BANKS || {};
window.BANKS.growthIteration = {
  growth: [
    {
      id: 'tree',
      startPool: [1.5, 2, 2.5, 3],
      ratePool: [8, 10, 12, 15, 20],
      template: '{Name} plants a tree that is {start} m in height. ' +
                'The height of the tree increases by {rate}% each year. ' +
                'How many years will it take for the tree to reach a height of {target} m?'
    },
    {
      id: 'savings',
      startPool: [400, 500, 600, 800, 1000, 1200],
      ratePool: [3, 4, 5, 6, 7, 8],
      template: '{Name} invests £{start} in a savings account. ' +
                'The value of the investment increases by {rate}% each year. ' +
                'After how many years is the investment worth more than £{target}?'
    },
    {
      id: 'population',
      startPool: [8000, 10000, 12000, 15000, 20000],
      ratePool: [4, 5, 6, 8, 10],
      template: 'The population of a village is {start}. ' +
                'The population increases by {rate}% each year. ' +
                'After how many years does the population first exceed {target}?'
    },
    {
      id: 'bacteria',
      startPool: [200, 500, 800, 1000, 1500],
      ratePool: [15, 20, 25, 30, 40],
      template: 'A scientist starts with {start} bacteria in a culture. ' +
                'The number of bacteria increases by {rate}% each hour. ' +
                'After how many hours are there more than {target} bacteria?'
    },
    {
      id: 'shrub',
      startPool: [40, 50, 60, 80, 100],
      ratePool: [10, 15, 20, 25],
      template: '{Name} plants a shrub that is {start} cm tall. ' +
                'The shrub grows by {rate}% each year. ' +
                'After how many years is the shrub taller than {target} cm?'
    },
    {
      id: 'followers',
      startPool: [200, 400, 500, 800, 1000],
      ratePool: [10, 15, 20, 25, 30],
      template: 'A social media account has {start} followers. ' +
                'The number of followers increases by {rate}% each week. ' +
                'After how many weeks does the account first have more than {target} followers?'
    }
  ],

  decay: [
    {
      id: 'car',
      startPool: [8000, 10000, 12000, 15000, 18000, 20000],
      ratePool: [10, 12, 15, 18, 20, 25],
      template: '{Name} buys a new car for £{start}. ' +
                'The value of the car depreciates by {rate}% each year. ' +
                'After how many years is the car worth less than £{target}?'
    },
    {
      id: 'laptop',
      startPool: [600, 800, 1000, 1200, 1500],
      ratePool: [15, 20, 25, 30],
      template: '{Name} buys a laptop for £{start}. ' +
                'The value of the laptop depreciates by {rate}% each year. ' +
                'After how many years is the laptop worth less than £{target}?'
    },
    {
      id: 'medicine',
      startPool: [200, 300, 400, 500, 600],
      ratePool: [20, 25, 30, 40, 50],
      template: 'A patient is given a dose of {start} mg of medicine. ' +
                'The amount of medicine in the bloodstream decreases by {rate}% each hour. ' +
                'After how many hours is the amount less than {target} mg?'
    },
    {
      id: 'forest',
      startPool: [2000, 3000, 4000, 5000, 8000],
      ratePool: [5, 8, 10, 12, 15],
      template: 'A forest covers an area of {start} km². ' +
                'The area decreases by {rate}% each year. ' +
                'After how many years is the area less than {target} km²?'
    },
    {
      id: 'radioactive',
      startPool: [400, 500, 600, 800, 1000],
      ratePool: [10, 15, 20, 25, 30],
      template: 'A radioactive sample has a mass of {start} g. ' +
                'The mass decreases by {rate}% each year. ' +
                'After how many years is the mass less than {target} g?'
    },
    {
      id: 'fish',
      startPool: [10000, 15000, 20000, 25000, 30000],
      ratePool: [8, 10, 12, 15, 20],
      template: 'A lake contains {start} fish. ' +
                'The number of fish decreases by {rate}% each year due to pollution. ' +
                'After how many years does the number of fish first fall below {target}?'
    }
  ]
};