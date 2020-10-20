<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import createCells from "./helpers/createCells.js";

  // Component parameters
  export let data = [];
  let cells = createCells(data);

  // Store version of parameters to allow for updating (if we want it)
  const _data = writable([]);
  const _cells = writable([]);

  $: _data.set(data);
  $: _cells.set(cells);

  const onCellUpdate = ({ x, y, index }, newValue) => {
    cells = [
      ...cells.slice(0, index),
      { ...cells[index], value: newValue },
      ...cells.slice(index + 1),
    ];
  };

  // context to share around child components
  $: context = {
    data: _data,
    cells: _cells,
    onCellUpdate,
  };

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
