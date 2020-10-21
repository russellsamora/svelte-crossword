<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import addClueNumber from "./helpers/addClueNumber.js";
  import createCells from "./helpers/createCells.js";

  export let data = [];

  let clues = addClueNumber(data);
  let cells = [];
  let focusedCellIndex = 0;
  $: focusedCell = cells[focusedCellIndex] || {};
  $: focusedDirection = "across"

  $: clues, cells = createCells(clues)

</script>

<style>
  article {
    display: flex;
  }
</style>

<article>
  <Clues {clues} {cells} bind:focusedCellIndex bind:focusedCell bind:focusedDirection />
  <Puzzle {clues} bind:cells bind:focusedCellIndex bind:focusedDirection />
</article>
