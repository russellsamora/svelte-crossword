<script>
  import { onMount } from "svelte";
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
  export let actions = ["clear", "reveal", "check"];
  export let theme = "classic";
  export let revealDuration = 1000;
  export let breakpoint = 720;
  export let revealed = false;
  export let disableHighlight = false;
  export let showCompleteMessage = true;
  export let showConfetti = true;
  export let showKeyboard;
  export let keyboardStyle = "outline";

  let width = 0;
  let focusedDirection = "across";
  let focusedCellIndex = 0;
  let isRevealing = false;
  let isLoaded = false;
  let isChecking = false;
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
  $: cells, (revealed = !clues.filter((d) => !d.isCorrect).length);
  $: stacked = width < breakpoint;
  $: inlineStyles = themeStyles[theme];

  onMount(() => {
    isLoaded = true;
  });

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
    isChecking = false;
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
  }

  function onReveal() {
    if (revealed) return true;
    reset();
    cells = cells.map((cell) => ({
      ...cell,
      value: cell.answer,
    }));
    startReveal();
  }

  function onCheck() {
    isChecking = true;
  }

  function startReveal() {
    isRevealing = true;
    isChecking = false;
    if (revealTimeout) clearTimeout(revealTimeout);
    revealTimeout = setTimeout(() => {
      isRevealing = false;
    }, revealDuration + 250);
  }

  function onToolbarEvent({ detail }) {
    if (detail === "clear") onClear();
    else if (detail === "reveal") onReveal();
    else if (detail === "check") onCheck();
  }
</script>

{#if validated}
  <article
    class="svelte-crossword"
    bind:offsetWidth="{width}"
    style="{inlineStyles}">
    <slot
      name="toolbar"
      onClear="{onClear}"
      onReveal="{onReveal}"
      onCheck="{onCheck}">
      <Toolbar actions="{actions}" on:event="{onToolbarEvent}" />
    </slot>

    <div class="play" class:stacked class:is-loaded="{isLoaded}">
      <Clues
        clues="{clues}"
        cellIndexMap="{cellIndexMap}"
        stacked="{stacked}"
        isDisableHighlight="{isDisableHighlight}"
        isLoaded="{isLoaded}"
        bind:focusedCellIndex
        bind:focusedCell
        bind:focusedDirection />
      <Puzzle
        clues="{clues}"
        focusedCell="{focusedCell}"
        isRevealing="{isRevealing}"
        isChecking="{isChecking}"
        isDisableHighlight="{isDisableHighlight}"
        revealDuration="{revealDuration}"
        showKeyboard="{showKeyboard}"
        stacked="{stacked}"
        isLoaded="{isLoaded}"
        keyboardStyle="{keyboardStyle}"
        bind:cells
        bind:focusedCellIndex
        bind:focusedDirection />
    </div>

    {#if isComplete && !isRevealing && showCompleteMessage}
      <CompletedMessage showConfetti="{showConfetti}">
        <slot name="message">
          <h3>You solved it!</h3>
        </slot>
      </CompletedMessage>
    {/if}
  </article>
{/if}

<style>
  article {
    position: relative;
    background-color: transparent;
    font-size: 16px;
  }

  .play {
    display: flex;
    flex-direction: var(--order, row);
  }

  .play.is-loaded.stacked {
    flex-direction: column;
  }

  h3 {
    margin: 0;
    margin-bottom: 0.5em;
  }

  @media only screen and (max-width: 720px) {
    .play:not(.is-loaded) {
      flex-direction: column;
    }
  }
</style>
