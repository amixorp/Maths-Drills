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