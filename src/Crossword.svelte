<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { fromPairs } from "./helpers/utils.js";
  import addClueNumber from "./helpers/addClueNumber.js";
  import createCells from "./helpers/createCells.js";

  export let data = [];

  let clues = addClueNumber(data);
  let cells = [];
  let focusedDirection = "across";
  let focusedCellIndex = 0;
  $: focusedCell = cells[focusedCellIndex] || {};

  $: clues, (cells = createCells(clues));

  $: cellIndexMap = fromPairs(cells.map((cell) => [cell["id"], cell["index"]]));
</script>

<article>
  <Clues
    clues="{clues}"
    cellIndexMap="{cellIndexMap}"
    bind:focusedCellIndex
    bind:focusedCell
    bind:focusedDirection />
  <Puzzle
    clues="{clues}"
    bind:cells
    bind:focusedDirection
    bind:focusedCellIndex
    focusedCell="{focusedCell}" />
</article>

<style>
  article {
    display: flex;
  }
</style>
