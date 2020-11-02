# svelte-crossword

By [Amelia Wattenberger](https://twitter.com/wattenberger) and [Russell Goldenberg](https://twitter.com/codenberg).

## Examples

[Example page](https://russellgoldenberg.github.io/svelte-crossword)

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

<Crossword data="{data}" />
```

## Parameters

#### Parameters

| parameter | default    | description                         |
| --------- | ---------- | ----------------------------------- |
| `data`    | _required_ | Array of crossword clue/answer data |
| `theme`   | `classic`  | String of preset theme to use       |

#### Bindings

| binding    | type    | description                                 |
| ---------- | ------- | ------------------------------------------- |
| `revealed` | Boolean | If the puzzle is showing all answers or not |

## Themes and Custom Styles

You can choose a preset theme by passing the prop:
`<Crossword theme="classic" />`

Available themes:

- `classic` (default)
- `dark`
- `citrus`

You can set your own global CSS variables to override theme defaults or roll-your-own. A list of properites can be found [here](https://github.com/russellgoldenberg/svelte-crossword/blob/main/src/themes/classic.js). Simply create new a CSS variable prefixed with `xd-` to override the defaults. For example...

```css
:root {
	--xd-primary-highlight-color: #f00;
```

For more detailed customization, simply do a more targeted CSS selection. For example...

```
	.crossword .cell text.number {
		font-size: 0.5em;
	}
```

## Features

- Generate puzzle from just clue/answer/positions data
- Toolbar options (reveal, clear)
- Fully responsive
- Optimized for mobile
- Preset style themes and fully customizable

## Development

```
cd example
npm run dev
```

## Notes

- Example data is from the October 21, 2020 NYT [mini crossword](https://www.nytimes.com/crosswords/game/mini/2020/10/21)
- Example data is from the October 21, 2020 NYT [daily crossword](https://www.nytimes.com/crosswords/game/daily/2020/10/21)

### Approaches

- [Context + Store](https://svelte.dev/repl/cb193342ca4e4d43af66b5c14167d117?version=3.29.0)
- [Prop + Binding](https://svelte.dev/repl/aa9159dabc8a40e48c1f6fad3a083e9e?version=3.29.0)
