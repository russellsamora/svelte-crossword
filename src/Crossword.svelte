<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { fromPairs } from "./helpers/utils.js";
  import addClueNumber from "./helpers/addClueNumber.js";
  import createCells from "./helpers/createCells.js";
  import validateClues from "./helpers/validateClues.js";

  export let data = [];

  let clues = addClueNumber(data);
  let valid = validateClues(clues);
  let cells = [];
  let focusedDirection = "across";
  let focusedCellIndex = 0;

  $: focusedCell = cells[focusedCellIndex] || {};
  $: clues, (cells = createCells(clues));
  $: cellIndexMap = fromPairs(cells.map((cell) => [cell["id"], cell["index"]]));

  const onClear = () => {
    cells = cells.map(cell => ({
      ...cell,
      value: "",
    }))
  }
</script>

<button on:click={onClear}>Clear</button>
<article>
  {#if valid}
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
  {/if}
</article>

<style>
  article {
    display: flex;
  }
</style>
