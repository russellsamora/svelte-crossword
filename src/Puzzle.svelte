<script>
  import { onMount } from "svelte";
  import Keyboard from "svelte-keyboard";
  import getSecondarilyFocusedCells from "./helpers/getSecondarilyFocusedCells.js";
  import getCellAfterDiff from "./helpers/getCellAfterDiff.js";
  import checkMobile from "./helpers/checkMobile.js";

  import Cell from "./Cell.svelte";

  export let clues;
  export let cells;
  export let focusedDirection;
  export let focusedCellIndex;
  export let focusedCell;
  export let isRevealing;
  export let isChecking;
  export let isDisableHighlight;
  export let stacked;
  export let revealDuration = 0;
  export let showKeyboard;
  export let isLoaded;
  export let keyboardStyle;

  let element;
  let cellsHistoryIndex = 0;
  let cellsHistory = [];
  let focusedCellIndexHistoryIndex = 0;
  let focusedCellIndexHistory = [];
  let secondarilyFocusedCells = [];
  let isMobile = false;
  let isPuzzleFocused = false;

  const numberOfStatesInHistory = 10;
  $: w = Math.max(...cells.map((d) => d.x)) + 1;
  $: h = Math.max(...cells.map((d) => d.y)) + 1;
  $: keyboardVisible =
    typeof showKeyboard === "boolean" ? showKeyboard : isMobile;

  $: cells, focusedCellIndex, focusedDirection, updateSecondarilyFocusedCells();
  $: sortedCellsInDirection = [...cells].sort((a, b) =>
    focusedDirection == "down" ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x
  );

  onMount(() => {
    isMobile = checkMobile();
  });

  function updateSecondarilyFocusedCells() {
    secondarilyFocusedCells = getSecondarilyFocusedCells({
      cells,
      focusedDirection,
      focusedCell,
    });
  }

  function onCellUpdate(index, newValue, diff = 1, doReplaceFilledCells) {
    doReplaceFilledCells = doReplaceFilledCells || !!cells[index].value;

    const dimension = focusedDirection == "across" ? "x" : "y";
    const clueIndex = cells[index].clueNumbers[focusedDirection];
    const cellsInClue = cells.filter(
      (cell) =>
        cell.clueNumbers[focusedDirection] == clueIndex &&
        (doReplaceFilledCells || !cell.value)
    );
    const cellsInCluePositions = cellsInClue
      .map((cell) => cell[dimension])
      .filter(Number.isFinite);
    const isAtEndOfClue =
      cells[index][dimension] == Math.max(...cellsInCluePositions);

    const newCells = [
      ...cells.slice(0, index),
      { ...cells[index], value: newValue },
      ...cells.slice(index + 1),
    ];
    cellsHistory = [newCells, ...cellsHistory.slice(cellsHistoryIndex)].slice(
      0,
      numberOfStatesInHistory
    );
    cellsHistoryIndex = 0;
    cells = newCells;

    if (isAtEndOfClue && diff > 0) {
      onFocusClueDiff(diff);
    } else {
      onFocusCellDiff(diff, doReplaceFilledCells);
    }
  }

  function onHistoricalChange(diff) {
    cellsHistoryIndex += -diff;
    cells = cellsHistory[cellsHistoryIndex] || cells;
    focusedCellIndexHistoryIndex += -diff;
    focusedCellIndex =
      focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex;
  }

  function onFocusCell(index) {
    if (isPuzzleFocused && index == focusedCellIndex) {
      onFlipDirection();
    } else {
      focusedCellIndex = index;
      
      if (!cells[focusedCellIndex].clueNumbers[focusedDirection]) {
        const newDirection = focusedDirection === "across" ? "down" : "across";
        focusedDirection = newDirection
      }

      focusedCellIndexHistory = [
        index,
        ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory),
      ];
      focusedCellIndexHistoryIndex = 0;
    }
  }

  function onFocusCellDiff(diff, doReplaceFilledCells = true) {
    const sortedCellsInDirectionFiltered = sortedCellsInDirection.filter((d) =>
      doReplaceFilledCells ? true : !d.value
    );
    const currentCellIndex = sortedCellsInDirectionFiltered.findIndex(
      (d) => d.index == focusedCellIndex
    );
    const nextCellIndex = (
      sortedCellsInDirectionFiltered[currentCellIndex + diff] || {}
    ).index;
    const nextCell = cells[nextCellIndex];
    if (!nextCell) return;
    onFocusCell(nextCellIndex);
  }

  function onFocusClueDiff(diff = 1) {
    const currentNumber = focusedCell.clueNumbers[focusedDirection];
    let nextCluesInDirection = clues.filter(
      (clue) =>
        !clue.isFilled &&
        (diff > 0
          ? clue.number > currentNumber
          : clue.number < currentNumber) &&
        clue.direction == focusedDirection
    );
    if (diff < 0) {
      nextCluesInDirection = nextCluesInDirection.reverse();
    }
    let nextClue = nextCluesInDirection[Math.abs(diff) - 1];
    if (!nextClue) {
      onFlipDirection();
      nextClue = clues.filter((clue) => clue.direction == focusedDirection)[0];
    }
    const nextFocusedCell =
      sortedCellsInDirection.find(
        (cell) =>
          !cell.value && cell.clueNumbers[focusedDirection] == nextClue.number
      ) || {};
    focusedCellIndex = nextFocusedCell.index || 0;
  }

  function onMoveFocus(direction, diff) {
    if (focusedDirection != direction) {
      const dimension = direction == "across" ? "x" : "y";
      focusedDirection = direction;
    } else {
      const nextCell = getCellAfterDiff({
        diff,
        cells,
        direction,
        focusedCell,
      });
      if (!nextCell) return;
      onFocusCell(nextCell.index);
    }
  }

  function onFlipDirection() {
    const newDirection = focusedDirection === "across" ? "down" : "across";
    const hasClueInNewDirection = !!focusedCell["clueNumbers"][newDirection];
    if (hasClueInNewDirection) focusedDirection = newDirection;
  }

  function onKeydown({ detail }) {
    const diff = detail === "Backspace" ? -1 : 1;
    const value = detail === "Backspace" ? "" : detail;
    onCellUpdate(focusedCellIndex, value, diff);
  }

  function onClick() {
    isPuzzleFocused = element.contains(document.activeElement);
  }
</script>

<svelte:window on:click="{onClick}" />

<section
  class="puzzle"
  class:stacked
  class:is-loaded="{isLoaded}"
  bind:this="{element}">
  <svg viewBox="0 0 {w} {h}">
    {#each cells as { x, y, value, answer, index, number, custom }}
      <Cell
        x="{x}"
        y="{y}"
        index="{index}"
        value="{value}"
        answer="{answer}"
        number="{number}"
        custom="{custom}"
        changeDelay="{isRevealing ? (revealDuration / cells.length) * index : 0}"
        isRevealing="{isRevealing}"
        isChecking="{isChecking}"
        isFocused="{focusedCellIndex == index && !isDisableHighlight}"
        isSecondarilyFocused="{secondarilyFocusedCells.includes(index) && !isDisableHighlight}"
        onFocusCell="{onFocusCell}"
        onCellUpdate="{onCellUpdate}"
        onFocusClueDiff="{onFocusClueDiff}"
        onMoveFocus="{onMoveFocus}"
        onFlipDirection="{onFlipDirection}"
        onHistoricalChange="{onHistoricalChange}" />
    {/each}
  </svg>
</section>

{#if keyboardVisible}
  <div class="keyboard">
    <Keyboard
      layout="crossword"
      style="{keyboardStyle}"
      on:keydown="{onKeydown}" />
  </div>
{/if}

<style>
  section {
    position: sticky;
    top: 1em;
    order: 0;
    flex: 1;
    height: fit-content;
  }

  section.is-loaded.stacked {
    position: relative;
    top: auto;
    height: auto;
    order: -1;
  }

  svg {
    width: 100%;
    display: block;
    font-size: 1px;
    background: var(--main-color);
    border: 4px solid var(--main-color);
    box-sizing: border-box;
  }

  .keyboard {
    order: 3;
  }

  @media only screen and (max-width: 720px) {
    section:not(.is-loaded) {
      position: relative;
      top: auto;
      height: auto;
      order: -1;
    }
  }
</style>
