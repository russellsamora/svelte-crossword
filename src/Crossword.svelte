<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
	import addClueIndex from "./helpers/addClueIndex.js";
  import createCells from "./helpers/createCells.js";

  // Component parameters
  export let data = [];
	let clues = addClueIndex(data);
  let cells = createCells(clues);
	console.log(clues);

  let puzzleElement;
  let focusedCell = {}
  // Store version of parameters to allow for updating (if we want it)
  const _data = writable([]);
  const _cells = writable([]);
  const _focusedCell = writable([]);

  $: _data.set(data);
  $: _cells.set(cells);
  $: _focusedCell.set(focusedCell);

  const getCoordsString = cell => [cell["x"], cell["y"]].join("-")
  const getCellIndexAtCoords = (x, y) => (
    cells.findIndex(cell => getCoordsString(cell) == [cell["x"], cell["y"]].join("-"))
  )
  const getCellAtCoords = (x, y) => (
    cells.find(cell => getCoordsString(cell) == [cell["x"], cell["y"]].join("-"))
  )
  const onCellUpdate = (index, newValue) => {
    const cellIndex = index - 1
    if (!Number.isFinite(index)) return
    cells = [
      ...cells.slice(0, cellIndex),
      { ...cells[cellIndex], value: newValue },
      ...cells.slice(cellIndex + 1),
    ];
    setTimeout(() => {
      onFocusNextCell()
    })
  };

  const onFocusCell = index => {
    focusedCell = cells[index - 1]
  }

  const onFocusNextCell = () => {
    const nextCell = cells[focusedCell["index"]]
    if (!nextCell) return
    onFocusCell(nextCell["index"])
  }

  // context to share around child components
  $: context = {
    data: _data,
    cells: _cells,
    focusedCell: _focusedCell,
    onCellUpdate,
    onFocusCell,
    onFocusNextCell,
  }

  $: setContext("Crossword", context);
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
    --dark-color: #222;
  }
</style>

<article>
  <div class="clues">
    <Clues />
  </div>
  <div class="puzzle" bind:this={puzzleElement}>
    <Puzzle />
  </div>
</article>
