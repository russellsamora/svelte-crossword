<script>
  import getSecondarilyFocusedCells from "./helpers/getSecondarilyFocusedCells.js";
  import getCellAfterDiff from "./helpers/getCellAfterDiff.js";

  import Cell from "./Cell.svelte";

  export let clues;
  export let cells;
  export let focusedDirection;
  export let focusedCellIndex;
  export let focusedCell;
  export let isRevealing;
	export let isDisableHighlight;
  export let revealDuration = 0;

  let cellsHistoryIndex = 0;
  let cellsHistory = [];
  let focusedCellIndexHistoryIndex = 0;
  let focusedCellIndexHistory = [];
  const numberOfStatesInHistory = 10;

  const w = Math.max(...cells.map((d) => d.x)) + 1;
  const h = Math.max(...cells.map((d) => d.y)) + 1;

  let secondarilyFocusedCells = [];
	
	function updateSecondarilyFocusedCells() {
    secondarilyFocusedCells = getSecondarilyFocusedCells({
      cells,
      focusedDirection,
      focusedCell,
    });
	}
	
  $: cells, focusedCellIndex, focusedDirection, updateSecondarilyFocusedCells();

  function onCellUpdate(index, newValue, diff = 1) {
    const doReplaceFilledCells = !!cells[index].value;
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

    onFocusCellDiff(diff, doReplaceFilledCells);
  }

  function onHistoricalChange(diff) {
    cellsHistoryIndex += -diff;
    cells = cellsHistory[cellsHistoryIndex] || cells;
    focusedCellIndexHistoryIndex += -diff;
    focusedCellIndex =
      focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex;
  }

  function onFocusCell(index) {
    if (index == focusedCellIndex) {
      onFlipDirection();
    } else {
      focusedCellIndex = index;
      focusedCellIndexHistory = [
        index,
        ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory),
      ];
      focusedCellIndexHistoryIndex = 0;
    }
  };

  $: sortedCellsInDirection = [...cells].sort((a, b) =>
    focusedDirection == "down" ? a.x - b.x || a.y - b.y : a.y - b.y || a.x - b.x
  )

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
        (diff > 0
          ? clue.number > currentNumber
          : clue.number < currentNumber) && clue.direction == focusedDirection
    );
    if (diff < 0) {
      nextCluesInDirection = nextCluesInDirection.reverse();
    }
    let nextClue = nextCluesInDirection[Math.abs(diff) - 1];
    if (!nextClue) {
      onFlipDirection();
      nextClue = clues.filter((clue) => clue.direction == focusedDirection)[0];
    }
    focusedCellIndex = cells.findIndex(
      (cell) => cell.x == nextClue.x && cell.y == nextClue.y
    );
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
    focusedDirection = {
      across: "down",
      down: "across",
    }[focusedDirection];
  }
</script>

<section class="puzzle">
  <svg viewBox="0 0 {w} {h}">
    <!-- svg -->
    {#each cells as { x, y, value, index, number, custom }}
      <Cell
        x="{x}"
        y="{y}"
        index="{index}"
        value="{value}"
        number="{number}"
        custom="{custom}"
        changeDelay="{isRevealing ? (revealDuration / cells.length) * index : 0}"
        isRevealing="{isRevealing}"
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

<style>
  section {
    flex: 1;
    height: fit-content;
  }
  svg {
    display: block;
    font-size: 1px;
    background: var(--cell-void-color, #1a1a1a);
    border: 4px solid var(--puzzle-border-color, #1a1a1a);
    font-family: var(--puzzle-font, -apple-system, Helvetica, sans-serif);
  }
	@media only screen and (min-width: 720px) {
		section {
			position: sticky;
    	top: 1em;
		}
	}
</style>
