# svelte-crossword

## Installation

`npm install svelte-crossword`

## Usage

```svelte
<script>
  import { Crossword } from "svelte-crossword";
	const data = [
	{
		"clue": "Sandwich cookie",
		"answer": "OREO",
		"direction": "across",
		"x": 0,
		"y": 0
	},
	{
		"clue": "Black-and-white cookie",
		"answer": "OREO",
		"direction": "down",
		"x": 0,
		"y": 0
	},
	{
		"clue": "Popular cookie",
		"answer": "OREO",
		"direction": "down",
		"x": 3,
		"y": 0
	},
	{
		"clue": "Creme-filled cookie",
		"answer": "OREO",
		"direction": "across",
		"x": 0,
		"y": 3
	}
]
</script>

<Crossword {data} />
```

## Roadmapread

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
