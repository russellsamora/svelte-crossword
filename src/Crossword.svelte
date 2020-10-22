<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import addClueNumber from "./helpers/addClueNumber.js";
  import createCells from "./helpers/createCells.js";
  import validateClues from "./helpers/validateClues.js";
	import { fromPairs } from "./helpers/utils.js";

  export let data = [];
	export let hideReset = false;
	export let hideReveal = false;

  let clues = addClueNumber(data);
  let validated = validateClues(clues);
  let cells = [];
  let focusedDirection = "across";
  let focusedCellIndex = 0;

  $: focusedCell = cells[focusedCellIndex] || {};
  $: clues, (cells = createCells(clues));
  $: cellIndexMap = fromPairs(cells.map((cell) => [cell["id"], cell["index"]]));
  
	function onReset() {
    cells = cells.map(cell => ({
      ...cell,
      value: "",
    }))
  }

	function onReveal() {
    cells = cells.map(cell => ({
      ...cell,
      value: cell.answer,
    }))
  }
</script>

<div class="toolbar">
	{#if !hideReset}
	<button on:click={onReset}>Reset</button>
	{/if}
	{#if !hideReveal}
	<button on:click={onReveal}>Reveal</button>
	{/if}
</div>

<article class="crossword">
  {#if validated}
    <Clues
      {clues}
      {cellIndexMap}
      bind:focusedCellIndex
      bind:focusedCell
      bind:focusedDirection />
    <Puzzle
      {clues}
			{focusedCell}
      bind:cells
			bind:focusedCellIndex
      bind:focusedDirection
		/>
  {/if}
</article>

<style>
  article {
    display: flex;
		display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
  }
</style>
