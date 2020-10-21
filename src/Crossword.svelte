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
    cells = [
      ...cells.slice(0, index),
      { ...cells[index], value: newValue },
      ...cells.slice(index + 1),
    ];
		// // what dis?
    setTimeout(() => {
      onFocusNextCell();
    });
  };

  const onFocusCell = index => {
    focusedCell = cells[index];
  }

  const onFocusNextCell = () => {
    const nextCell = cells[focusedCell.index + 1]
    if (!nextCell) return
    onFocusCell(nextCell.index)
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
