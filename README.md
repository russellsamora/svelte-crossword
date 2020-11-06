# svelte-crossword

By [Amelia Wattenberger](https://twitter.com/wattenberger) and [Russell Goldenberg](https://twitter.com/codenberg).

## Examples

[Example page](https://russellgoldenberg.github.io/svelte-crossword)

## Features

- Generate puzzle from simple JSON format
- Slottable toolbar that can tap into crossword methods
- Fully responsive
- Optimized for mobile with on-screen keyboard
- Preset style themes with customization
- Puzzle validation
- Custom class names for cells and clues

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

## Data format

An array of objects with the following required properties:

| property    | type   | description                           |
| ----------- | ------ | ------------------------------------- |
| `clue`      | String | Clue text                             |
| `answer`    | String | Answer text (auto-capitalizes)        |
| `direction` | String | "across" or "down"                    |
| `x`         | Number | starting x position (column) of clue  |
| `y`         | Number | starting y position (row) of clue     |
| `custom`    | String | _optional_ custom class name to apply |

```json
[
  {
    "clue": "Clue text",
    "answer": "ANSWER",
    "direction": "across",
    "x": 0,
    "y": 0,
    "custom": "class-name"
  }
]
```

Note: X and Y coordinates can be zero or one based, it will detect automatically.

## Parameters

| parameter             | default               | type    | description                                                                         |
| --------------------- | --------------------- | ------- | ----------------------------------------------------------------------------------- |
| `data`                | _required_            | Array   | crossword clue/answer data                                                          |
| `theme`               | `"classic"`           | String  | preset theme to use                                                                 |
| `actions`             | `["clear", "reveal"]` | Array   | toolbar actions                                                                     |
| `revealDuration`      | `1000`                | Number  | reveal transition duration in ms                                                    |
| `breakpoint`          | `720`                 | Number  | when to switch to stacked layout                                                    |
| `disableHighlight`    | `false`               | Boolean | turn off puzzle highlight                                                           |
| `showCompleteMessage` | `true`                | Boolean | show message overlay after completion                                               |
| `showConfetti`        | `true`                | Boolean | show confetti during completion message                                             |
| `showKeyboard`        | `false`               | Boolean | force on-screen keyboard display (overriding auto-check)                            |
| `keyboardStyle`       | `"outline"`           | String  | [keyboard button style](https://github.com/russellgoldenberg/svelte-keyboard#style) |

## Bindings

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

You can set your own global CSS variables to override theme defaults or roll-your-own. Simply create new a CSS variable prefixed with `xd-` to override the defaults. A `Crossword` component has a top-level class of `.svelte-crossword`.

### Properties (with defaults)

```css
.svelte-crossword {
  --xd-font: sans-serif; /* font-family for whole puzzle */
  --xd-primary-highlight-color: #ffcc00; /* color for focused cell */
  --xd-secondary-highlight-color: #ffec99; /* color for other cells in current clue */
  --xd-main-color: #1a1a1a; /* color for text, gridlines, void cells */
  --xd-bg-color: #fff; /* color for puzzle background */
  --xd-accent-color: #efefef; /* color for buttons */
  --xd-scrollbar-color: #cdcdcd; /* color for scrollbar handle */
  --xd-order: row; /* row = clues on left, row-reverse = clues on right  */
}
```

For more detailed customization, simply do a more targeted CSS selection. For example...

```css
.svelte-crossword .cell text.number {
  font-size: 0.5em;
}
```

## Custom Slots

You can provide more fine-grained control over the toolbar and completion message with custom slots.

#### Toolbar

```svelte
<Crossword>
	<div
		class="toolbar"
		slot="toolbar"
		let:onClear
		let:onReveal >
		<button on:click="{onClear}">clear puzzle</button>
		<button on:click="{onReveal}">show answers</button>
	</div>
<Crossword>
```

#### Completion Message

```svelte
<Crossword>
	<div slot="complete">
		<h3>OMG, congrats!</h3>
		<img
			alt="celebration"
			src="https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif" />
	</div>
</Crossword>
```

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
