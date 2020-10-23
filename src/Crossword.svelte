<script>
  import Toolbar from "./Toolbar.svelte";
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import CompletedMessage from "./CompletedMessage.svelte";
  import createClues from "./helpers/createClues.js";
  import createCells from "./helpers/createCells.js";
  import validateClues from "./helpers/validateClues.js";
  import { fromPairs } from "./helpers/utils.js";

  export let data = [];
  export let revealed = false;
  export let actions = ["reset", "reveal"];
  export let revealDuration = 1000;
  export let theme = "classic";
  export let disableHighlight = false;
	export let showCompleteMessage = true;

  let originalClues = createClues(data);
  let validated = validateClues(originalClues);
  let clues = originalClues.map((d) => ({ ...d }));
  let cells = createCells(originalClues);
  let focusedDirection = "across";
  let focusedCellIndex = 0;
  let isRevealing = false;
  let revealTimeout;
  let clueCompletion;

  $: focusedCell = cells[focusedCellIndex] || {};
  $: cellIndexMap = fromPairs(cells.map((cell) => [cell.id, cell.index]));
  $: percentCorrect =
    cells.filter((d) => d.answer === d.value).length / cells.length;
  $: isComplete = percentCorrect == 1;
  $: themeClass = theme ? `theme-${theme}` : "";
  $: isDisableHighlight = isComplete && disableHighlight;
  $: cells, (clues = checkClues());

  function checkClues() {
    return clues.map((d) => {
      const index = d.index;
      const cellChecks = d.cells.map((c) => {
        const { value } = cells.find((e) => e.id === c.id);
        const hasValue = !!value;
        const hasCorrect = value === c.answer;
        return { hasValue, hasCorrect };
      });
      const isCorrect =
        cellChecks.filter((c) => c.hasCorrect).length === d.answer.length;
      const isFilled =
        cellChecks.filter((c) => c.hasValue).length === d.answer.length;
      return {
        ...d,
        isCorrect,
        isFilled,
      };
    });
  }

  function clear() {
    isRevealing = false;
    focusedCellIndex = 0;
    focusedDirection = "across";
  }

  function onReset() {
    clear();
    if (revealTimeout) clearTimeout(revealTimeout);
    cells = cells.map((cell) => ({
      ...cell,
      value: "",
    }));
    revealed = false;
  }

  function onReveal() {
    if (revealed) return true;
    clear();
    cells = cells.map((cell) => ({
      ...cell,
      value: cell.answer,
    }));
    revealed = true;
    startReveal();
  }

  function startReveal() {
    isRevealing = true;
    if (revealTimeout) clearTimeout(revealTimeout);
    revealTimeout = setTimeout(() => {
      isRevealing = false;
    }, revealDuration + 250);
  }

  function onToolbarEvent({ detail }) {
    if (detail === "reset") onReset();
    else if (detail === "reveal") onReveal();
  }
</script>

<slot name="toolbar" onReset="{onReset}" onReveal="{onReveal}">
  <Toolbar actions="{actions}" on:event="{onToolbarEvent}" />
</slot>

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
      isDisableHighlight="{isDisableHighlight}"
      revealDuration="{revealDuration}"
      bind:cells
      bind:focusedCellIndex
      bind:focusedDirection />
  {/if}

  {#if isComplete && !isRevealing && showCompleteMessage}
    <CompletedMessage>
      <slot name="complete" />
    </CompletedMessage>
  {/if}
</article>

<style>
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

  .theme-dark {
    --theme-puzzle-border-color: #8a8a8a;
    --theme-puzzle-font: -apple-system, Helvetica, sans-serif;
    
		--theme-clue-font: -apple-system, Helvetica, sans-serif;
    --theme-clue-text-color: #fff;
    --theme-clue-background-color: #1a1a1a;
    --theme-clue-scrollbar-bg: #5a5a5a;
    --theme-clue-scrollbar-fg: #efefef;
    --theme-clue-puzzle-order: row;
    --theme-clue-list-width: 16em;
    
		--theme-cell-highlight-color: #066;
    --theme-cell-secondary-color: #003d3d;
    --theme-cell-bg-color: #1a1a1a;
    --theme-cell-border-color: #8a8a8a;
    --theme-cell-border-width: 0.01;
    --theme-cell-text-color: #fff;
    --theme-cell-font-size: 0.7em;
    --theme-cell-font-weight: 700;
    --theme-cell-void-color: #1a1a1a;
    
		--theme-number-font-size: 0.3em;
    --theme-number-font-weight: 400;
    --theme-number-color: #cdcdcd;
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

  .theme-citrus {
    --theme-puzzle-border-color: #193939;
    --theme-puzzle-font: -apple-system, Helvetica, sans-serif;

    --theme-clue-font: -apple-system, Helvetica, sans-serif;
    --theme-clue-text-color: #193939;
    --theme-clue-background-color: #fff;
    --theme-clue-scrollbar-bg: #ebf3f3;
    --theme-clue-scrollbar-fg: #c9d8d8;
    --theme-clue-puzzle-order: row;
    --theme-clue-list-width: 16em;

    --theme-cell-highlight-color: #ffdfd5;
    --theme-cell-secondary-color: #ff957d;
    --theme-cell-bg-color: #fff;
    --theme-cell-border-color: #193939;
    --theme-cell-border-width: 0.01;
    --theme-cell-text-color: #193939;
    --theme-cell-font-size: 0.7em;
    --theme-cell-font-weight: 700;
    --theme-cell-void-color: #266b6b;

    --theme-number-font-size: 0.3em;
    --theme-number-font-weight: 400;
    --theme-number-color: #266b6b;
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
    --clue-background-color: var(
      --theme-clue-background-color,
      var(--theme-clue-background-color)
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

    position: relative;
    display: flex;
    flex-direction: var(--clue-puzzle-order, row);
  }
</style>
