# svelte-crossword

By [Amelia Wattenberger](https://twitter.com/wattenberger) and [Russell Goldenberg](https://twitter.com/codenberg).

## Installation

`npm install svelte-crossword`

## Usage

```svelte
<script>
</script>

<Crossword data="{data}" />

```

## Custom Style

TODO

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
