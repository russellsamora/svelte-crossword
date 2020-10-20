<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import createBoard from "./helpers/createBoard.js";

  // Component parameters
  export let data = [];
  export let cells = [
    {coords: [0, 0], value: "A"},
    {coords: [0, 1], value: "L"},
    {coords: [0, 2], value: "E"},
    {coords: [1, 0], value: "P"},
    {coords: [1, 1], value: "O"},
    {coords: [1, 2], value: "E"},
    {coords: [2, 0], value: "E"},
    {coords: [2, 1], value: "G"},
    {coords: [2, 2], value: "G"},
  ];

  // Store version of parameters to allow for updating (if we want it)
  const _data = writable(null);
  const _cells = writable([]);

  $: _data.set(data);
  $: _cells.set(cells);

  const onCellUpdate = (coords, newValue) => {
    const cellIndex = cells.findIndex(cell => cell["coords"].join(", ") == coords.join(", "))
    if (!Number.isFinite(cellIndex)) return
    cells = [
      ...cells.slice(0, cellIndex),
      {...cells[cellIndex], value: newValue},
      ...cells.slice(cellIndex + 1),
    ]
  }

  // context to share around child components
  $: context = {
    data: _data,
    cells: _cells,
    onCellUpdate,
  }

  $: setContext("Crossword", context);

  const puzzle = createBoard(data);
</script>

<style>
article {
  display: flex;
}
.clues {
  flex: 0 1 16em;
}
.puzzle {
  flex: 3;
}
</style>

<article>
  <div class="clues">
    <Clues />
  </div>
  <div class="puzzle">
    <Puzzle />
  </div>
</article>
