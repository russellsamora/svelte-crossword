<script>
  import Toolbar from "./Toolbar.svelte";
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import CompletedMessage from "./CompletedMessage.svelte";
  import createClues from "./helpers/createClues.js";
  import createCells from "./helpers/createCells.js";
  import validateClues from "./helpers/validateClues.js";
  import { fromPairs } from "./helpers/utils.js";
  import themeStyles from "./helpers/themeStyles.js";

  export let data = [];
  export let actions = ["clear", "reveal"];
  export let theme = "classic";
  export let revealDuration = 1000;
  export let breakpoint = 720;
  export let revealed = false;
  export let disableHighlight = false;
  export let showCompleteMessage = true;
  export let showConfetti = true;
  export let showKeyboard = false;

  let width = 0;
  let focusedDirection = "across";
  let focusedCellIndex = 0;
  let isRevealing = false;
  let revealTimeout;
  let clueCompletion;

  let originalClues = [];
  let validated = [];
  let clues = [];
  let cells = [];

  const onDataUpdate = () => {
    originalClues = createClues(data);
    validated = validateClues(originalClues);
    clues = originalClues.map((d) => ({ ...d }));
    cells = createCells(originalClues);
    reset();
  };

  $: data, onDataUpdate();
  $: focusedCell = cells[focusedCellIndex] || {};
  $: cellIndexMap = fromPairs(cells.map((cell) => [cell.id, cell.index]));
  $: percentCorrect =
    cells.filter((d) => d.answer === d.value).length / cells.length;
  $: isComplete = percentCorrect == 1;
  $: isDisableHighlight = isComplete && disableHighlight;
  $: cells, (clues = checkClues());
  $: stacked = width < breakpoint;
  $: inlineStyles = themeStyles[theme];

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

  function reset() {
    isRevealing = false;
    focusedCellIndex = 0;
    focusedDirection = "across";
  }

  function onClear() {
    reset();
    if (revealTimeout) clearTimeout(revealTimeout);
    cells = cells.map((cell) => ({
      ...cell,
      value: "",
    }));
    revealed = false;
  }

  function onReveal() {
    if (revealed) return true;
    reset();
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
    if (detail === "clear") onClear();
    else if (detail === "reveal") onReveal();
  }
</script>

{#if validated}
  <article class="crossword" bind:offsetWidth="{width}" style="{inlineStyles}">
    <slot name="toolbar" onClear="{onClear}" onReveal="{onReveal}">
      <Toolbar actions="{actions}" on:event="{onToolbarEvent}" />
    </slot>

    <div class="play" class:stacked>
      <Clues
        clues="{clues}"
        cellIndexMap="{cellIndexMap}"
        stacked="{stacked}"
        bind:focusedCellIndex
        bind:focusedCell
        bind:focusedDirection />
      <Puzzle
        clues="{clues}"
        focusedCell="{focusedCell}"
        isRevealing="{isRevealing}"
        isDisableHighlight="{isDisableHighlight}"
        revealDuration="{revealDuration}"
        showKeyboard="{showKeyboard}"
        stacked="{stacked}"
        bind:cells
        bind:focusedCellIndex
        bind:focusedDirection />
    </div>

    {#if isComplete && !isRevealing && showCompleteMessage}
      <CompletedMessage showConfetti="{showConfetti}">
        <slot name="complete" />
      </CompletedMessage>
    {/if}
  </article>
{/if}

<style>
  article {
    position: relative;
    background-color: var(--bg);
    font-size: 16px;
  }

  .play {
    display: flex;
    flex-direction: var(--order, row);
  }

  .play.stacked {
    flex-direction: column;
  }
</style>
