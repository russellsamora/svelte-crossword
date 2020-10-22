<script>
	import Toolbar from "./Toolbar.svelte";
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import CompletedMessage from "./CompletedMessage.svelte";
  import addClueNumber from "./helpers/addClueNumber.js";
  import createCells from "./helpers/createCells.js";
  import validateClues from "./helpers/validateClues.js";
  import { fromPairs } from "./helpers/utils.js";

  export let data = [];
  export let hideReset = false;
  export let hideReveal = false;
  export let revealed = false;
  export let revealDuration = 1300;

  let clues = addClueNumber(data);
  let validated = validateClues(clues);
  let cells = [];
  let focusedDirection = "across";
  let focusedCellIndex = 0;
  let isRevealing = false;

  $: focusedCell = cells[focusedCellIndex] || {};
  $: clues, (cells = createCells(clues));
  $: cellIndexMap = fromPairs(cells.map((cell) => [cell.id, cell.index]));
  $: percentCorrect =
    cells.filter((d) => d.answer == d.value).length / cells.length;
  $: isComplete = percentCorrect == 1;

  let timeout;

  function onReset() {
    isRevealing = false;
    cells = cells.map((cell) => ({
      ...cell,
      value: "",
    }));
    revealed = false;
    startReveal();
  }

  function onReveal() {
    isRevealing = false;
    cells = cells.map((cell) => ({
      ...cell,
      value: cell.answer,
    }));
    revealed = true;
    startReveal();
  }

  function startReveal() {
    isRevealing = true;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      isRevealing = false;
    }, revealDuration + 300);
  };

	function onToolbarEvent({ detail }) {
		if (detail === 'reset') onReset();
		else if (detail === 'reveal') onReveal();
	}

</script>


<Toolbar {hideReset} {hideReveal} on:event={onToolbarEvent} />

<article class="crossword">
  {#if validated}
    <Clues
      clues="{clues}"
      cellIndexMap="{cellIndexMap}"
      bind:focusedCellIndex
      bind:focusedCell
      bind:focusedDirection />
    <Puzzle
      clues="{clues}"
      focusedCell="{focusedCell}"
      isRevealing="{isRevealing}"
      revealDuration="{revealDuration}"
      bind:cells
      bind:focusedCellIndex
      bind:focusedDirection />
  {/if}

  {#if isComplete && !isRevealing}
    <CompletedMessage />
  {/if}
</article>

<style>
  article {
    position: relative;
    display: flex;
    flex-direction: var(--clue-puzzle-order, row);
  }
</style>
