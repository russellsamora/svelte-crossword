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
  }

  function onToolbarEvent({ detail }) {
    if (detail === "reset") onReset();
    else if (detail === "reveal") onReveal();
  }
</script>

<Toolbar
  hideReset="{hideReset}"
  hideReveal="{hideReveal}"
  on:event="{onToolbarEvent}" />

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
    --theme-puzzle-border-color: #1a1a1a;
    --theme-puzzle-font: -apple-system, Helvetica, sans-serif;

    --theme-clue-font: -apple-system, Helvetica, sans-serif;
    --theme-clue-text-color: #1a1a1a;
    --theme-clue-scrollbar-bg: #efefef;
    --theme-clue-scrollbar-fg: #cdcdcd;
    --theme-clue-puzzle-order: row;
    --theme-clue-list-width: 16em;

    --theme-cell-highlight-color: #ffec99;
    --theme-cell-secondary-color: #ffcc00;
    --theme-cell-bg-color: #fff;
    --theme-cell-border-color: #1a1a1a;
    --theme-cell-border-width: 0.01;
    --theme-cell-text-color: #1a1a1a;
    --theme-cell-font-size: 0.7em;
    --theme-cell-font-weight: 700;
    --theme-cell-void-color: #1a1a1a;

    --theme-number-font-size: 0.3em;
    --theme-number-font-weight: 400;
    --theme-number-color: #8a8a8a;
  }

  .theme-amelia {
    --theme-puzzle-border-color: #353b48;
    --theme-puzzle-font: -apple-system, Helvetica, sans-serif;

    --theme-clue-font: -apple-system, Helvetica, sans-serif;
    --theme-clue-text-color: #353b48;
    --theme-clue-scrollbar-bg: #d7cefd;
    --theme-clue-scrollbar-fg: #9980fa;
    --theme-clue-puzzle-order: row;
    --theme-clue-list-width: 16em;

    --theme-cell-highlight-color: #d7cefd;
    --theme-cell-secondary-color: #9980fa;
    --theme-cell-bg-color: #fff;
    --theme-cell-border-color: #353b48;
    --theme-cell-border-width: 0.027;
    --theme-cell-text-color: #353b48;
    --theme-cell-font-size: 0.76em;
    --theme-cell-font-weight: 700;
    --theme-cell-void-color: #353b48;

    --theme-number-font-size: 0.25em;
    --theme-number-font-weight: 100;
    --theme-number-color: #353b48;
  }

	.theme-russell {
    --theme-puzzle-border-color: red;
    --theme-puzzle-font: -apple-system, Helvetica, sans-serif;

    --theme-clue-font: -apple-system, Helvetica, sans-serif;
    --theme-clue-text-color: green;
    --theme-clue-scrollbar-bg: orange;
    --theme-clue-scrollbar-fg: pink;
    --theme-clue-puzzle-order: row;
    --theme-clue-list-width: 16em;

    --theme-cell-highlight-color: orange;
    --theme-cell-secondary-color: pink;
    --theme-cell-bg-color: yellow;
    --theme-cell-border-color: green;
    --theme-cell-border-width: 0.027;
    --theme-cell-text-color: blue;
    --theme-cell-font-size: 0.76em;
    --theme-cell-font-weight: 700;
    --theme-cell-void-color: blue;

    --theme-number-font-size: 0.25em;
    --theme-number-font-weight: 100;
    --theme-number-color: blue;
  }

  article {
    --puzzle-border-color: var(
      --theme-puzzle-border-color,
      var(--theme-puzzle-border-color)
    );
    --puzzle-font: var(--theme-puzzle-font, var(--theme-puzzle-font));
    --clue-font: var(--theme-clue-font, var(--theme-clue-font));
    --clue-text-color: var(
      --theme-clue-text-color,
      var(--theme-clue-text-color)
    );
    --clue-scrollbar-bg: var(
      --theme-clue-scrollbar-bg,
      var(--theme-clue-scrollbar-bg)
    );
    --clue-scrollbar-fg: var(
      --theme-clue-scrollbar-fg,
      var(--theme-clue-scrollbar-fg)
    );
    --clue-puzzle-order: var(
      --theme-clue-puzzle-order,
      var(--theme-clue-puzzle-order)
    );
    --clue-list-width: var(
      --theme-clue-list-width,
      var(--theme-clue-list-width)
    );
    --cell-highlight-color: var(
      --theme-cell-highlight-color,
      var(--theme-cell-highlight-color)
    );
    --cell-secondary-color: var(
      --theme-cell-secondary-color,
      var(--theme-cell-secondary-color)
    );
    --cell-bg-color: var(--theme-cell-bg-color, var(--theme-cell-bg-color));
    --cell-border-color: var(
      --theme-cell-border-color,
      var(--theme-cell-border-color)
    );
    --cell-border-width: var(
      --theme-cell-border-width,
      var(--theme-cell-border-width)
    );
    --cell-text-color: var(
      --theme-cell-text-color,
      var(--theme-cell-text-color)
    );
    --cell-font-size: var(--theme-cell-font-size, var(--theme-cell-font-size));
    --cell-font-weight: var(
      --theme-cell-font-weight,
      var(--theme-cell-font-weight)
    );
    --cell-void-color: var(
      --theme-cell-void-color,
      var(--theme-cell-void-color)
    );
    --number-font-size: var(
      --theme-number-font-size,
      var(--theme-number-font-size)
    );
    --number-font-weight: var(
      --theme-number-font-weight,
      var(--theme-number-font-weight)
    );
    --number-color: var(--theme-number-color, var(--theme-number-color));
  }
</style>
