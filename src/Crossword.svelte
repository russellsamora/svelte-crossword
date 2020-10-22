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
  export let revealDuration = 1000;
	export let theme;

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
	$: themeClass = theme ? `theme-${theme}` : "";

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

<article class="crossword {themeClass}">
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
	.theme-classic {
		--puzzle-border-color: #1a1a1a;
		--puzzle-font: -apple-system, Helvetica, sans-serif;

		--clue-font: -apple-system, Helvetica, sans-serif;
		--clue-text-color: #1a1a1a;
		--clue-scrollbar-bg: #efefef;
		--clue-scrollbar-fg: #cdcdcd;
		--clue-puzzle-order: row;
		--clue-list-width: 16em;

		--cell-highlight-color: #ffec99;
		--cell-secondary-color: #ffcc00;
		--cell-bg-color: #fff;
		--cell-border-color: #1a1a1a;
		--cell-border-width: 0.01;
		--cell-text-color: #1a1a1a;
		--cell-font-size: 0.7em;
		--cell-font-weight: 700;
		--cell-void-color: #1a1a1a;

		--number-font-size: 0.3em;
		--number-font-weight: 400;
		--number-color: #8a8a8a;
	}

	.theme-amelia {
		--puzzle-border-color: #114d4d;
		--puzzle-font: -apple-system, Helvetica, sans-serif;

		--clue-font: -apple-system, Helvetica, sans-serif;
		--clue-text-color: #114d4d;
		--clue-scrollbar-bg: #d7cefd;
		--clue-scrollbar-fg: #9980fa;
		--clue-puzzle-order: row;
		--clue-list-width: 16em;

		--cell-highlight-color: #d7cefd;
		--cell-secondary-color: #9980fa;
		--cell-bg-color: #fff;
		--cell-border-color: #114d4d;
		--cell-border-width: 0.01;
		--cell-text-color: #114d4d;
		--cell-font-size: 0.7em;
		--cell-font-weight: 700;
		--cell-void-color: #114d4d;

		--number-font-size: 0.3em;
		--number-font-weight: 400;
		--number-color: #114d4d;
	}
</style>
