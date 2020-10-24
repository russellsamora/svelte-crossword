# svelte-crossword

By [Amelia Wattenberger](https://twitter.com/wattenberger) and [Russell Goldenberg](https://twitter.com/codenberg).

## Installation

`npm install svelte-crossword`

## Usage

```javascript
<script>
  import Crossword from "svelte-crossword";
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

## Themes and Custom Styles

You can choose a preset theme by passing the prop:
`<Crossword theme="classic" />`

Available themes:

- `classic`
- `amelia`
- `russell`

You can set your own global CSS variables to override theme defaults or roll-your-own.

```
--crossword-bg: transparent;
--puzzle-border-color: #1a1a1a;
--puzzle-font: -apple-system, Helvetica, sans-serif;

--clue-font: -apple-system, Helvetica, sans-serif;
--clue-text-color: #1a1a1a;
--clue-scrollbar-bg: #efefef;
--clue-scrollbar-fg: #cdcdcd;
--clue-puzzle-order: row;
--clue-list-width: 16em;

--cell-highlight-color: #ffec99;
--cell-secondary-color: #ffcc00;
--cell-bg-color: #fff;
--cell-border-color: #1a1a1a;
--cell-border-width: 0.01;
--cell-text-color: #1a1a1a;
--cell-font-size: 0.7em;
--cell-font-weight: 700;
--cell-void-color: #1a1a1a;

--number-font-size: 0.3em;
--number-font-weight: 400;
--number-color: #8a8a8a;
```

## Features

- Generate puzzle from just clue/answer/positions data
- Toolbar options (reveal, reset)
- Fully responsive
- Optimized for mobile
- Preset style themes and fully customizable

## Development

`npm run dev`

## Notes

- Example data is from the October 21, 2020 NYT [mini crossword](https://www.nytimes.com/crosswords/game/mini/2020/10/21)
- Example data is from the October 22, 2020 NYT [mini crossword](https://www.nytimes.com/crosswords/game/daily/2020/10/21)

### Approaches

- [Context + Store](https://svelte.dev/repl/cb193342ca4e4d43af66b5c14167d117?version=3.29.0)
- [Prop + Binding](https://svelte.dev/repl/aa9159dabc8a40e48c1f6fad3a083e9e?version=3.29.0)
