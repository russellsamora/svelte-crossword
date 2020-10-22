# svelte-crossword

By [Amelia Wattenberger](https://twitter.com/wattenberger) and [Russell Goldenberg](https://twitter.com/codenberg).

## Installation

`npm install svelte-crossword`

## Usage

```javascript
<script>
  import { Crossword } from "svelte-crossword";
  const data = [
    {
      "clue": "Black-and-white cookie",
      "answer": "OREO",
      "direction": "down",
      "x": 0,
      "y": 0
    },
    ...
  ]
</script>

<Crossword {data} />
```

## Custom Style

You can set your own global CSS variables to override the defaults.

```
--cell-highlight-color: #ffec99;
--cell-secondary-color: #ffcc00;
--cell-bg-color: #fff;
--cell-border-color: #1a1a1a;
--cell-border-width: 0.01;
--cell-text-color: #1a1a1a;
--cell-font-size: 1em;
--cell-font-weight: 700;
--cell-void-color: #1a1a1a;

--number-font-size: 0.1em;
--number-font-weight: 400;
--number-color: #8a8a8a;

--puzzle-border-color: #1a1a1a;
--puzzle-font: -apple-system, Helvetica, sans-serif;

--clue-font: -apple-system, Helvetica, sans-serif;
--clue-text-color: #1a1a1a;
--clue-scrollbar-bg: #efefef;
--clue-scrollbar-fg: #cdcdcd;
--clue-puzzle-order: row;
```

## Roadmap

- Generate puzzle and clues from a data source (format json)
- Ability to clear or fill
- Focus / unfocus for key type bindings
- Move to next cell on type
- Current cell(s) is highligted and bound to clue highlight
- List of clues is clickable to jump to cell and highlights cells
- Mobile layout for clues
- Multiple taps or arrow on same cell changes directional highlight
- Multiple clue layout configurations
- Fully customizable style options
- Converter function to parse txt file board/clues to array
- Validate data format
- Custom class on cells
- Completion state

## Development

`npm run dev`

## Notes

Example data is from the October 21, 2020 NYT [mini crossword](https://www.nytimes.com/crosswords/game/mini).

### Approaches

- [Context + Store](https://svelte.dev/repl/cb193342ca4e4d43af66b5c14167d117?version=3.29.0)
- [Prop + Binding](https://svelte.dev/repl/aa9159dabc8a40e48c1f6fad3a083e9e?version=3.29.0)
