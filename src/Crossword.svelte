<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
	import addClueNumber from "./helpers/addClueNumber.js";
  import createCells from "./helpers/createCells.js";

  // Component parameters
  export let data = [];
	let clues = addClueNumber(data);
  let cells = createCells(clues);

  let focusedCell = {}
  // Store version of parameters to allow for updating (if we want it)
  const _data = writable([]);
	const _clues = writable([]);
  const _cells = writable([]);
  const _focusedCell = writable([]);

  $: _data.set(data);
  $: _cells.set(cells);
	$: _clues.set(clues);
  $: _focusedCell.set(focusedCell);

  const onCellUpdate = (index, newValue) => {
    const cellIndex = index - 1;
    if (!Number.isFinite(index)) return
    cells = [
      ...cells.slice(0, cellIndex),
      { ...cells[cellIndex], value: newValue },
      ...cells.slice(cellIndex + 1),
    ];
		// what dis?
    setTimeout(() => {
      onFocusNextCell();
    });
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
		clues: _clues,
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
</style>

<article>
  <Clues />
  <Puzzle />
</article>
