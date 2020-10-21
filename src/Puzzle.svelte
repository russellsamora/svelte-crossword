<script>
  import getSecondarilyFocusedCells from "./helpers/getSecondarilyFocusedCells.js";
  import getCellAfterDiff from "./helpers/getCellAfterDiff.js";

  import Cell from "./Cell.svelte";

  export let clues;
  export let cells;
  export let focusedDirection;
  export let focusedCellIndex;
  export let focusedCell;

  let cellsHistoryIndex = 0
  let cellsHistory = []
  let focusedCellIndexHistoryIndex = 0
  let focusedCellIndexHistory = []
  const numberOfStatesInHistory = 10

  const w = Math.max(...cells.map((d) => d.x)) + 1;
  const h = Math.max(...cells.map((d) => d.y)) + 1;

  let secondarilyFocusedCells = [];
  const updateSecondarilyFocusedCells = () => {
    secondarilyFocusedCells = getSecondarilyFocusedCells({
      cells,
      focusedDirection,
      focusedCell,
    });
  };
  $: cells, focusedCellIndex, focusedDirection, updateSecondarilyFocusedCells();

  const onCellUpdate = (index, newValue) => {
    const newCells = [
      ...cells.slice(0, index),
      { ...cells[index], value: newValue },
      ...cells.slice(index + 1),
    ];
    cellsHistory = [
      newCells,
      ...cellsHistory.slice(cellsHistoryIndex)
    ].slice(0, numberOfStatesInHistory)
    cellsHistoryIndex = 0
    cells = newCells

    onFocusNextCell();
  };

  const onHistoricalChange = diff => {
    cellsHistoryIndex += -diff
    cells = cellsHistory[cellsHistoryIndex] || cells
    focusedCellIndexHistoryIndex += -diff
    focusedCellIndex = focusedCellIndexHistory[cellsHistoryIndex] || focusedCellIndex
  }

  const onFocusCell = (index) => {
    if (index == focusedCellIndex) {
      onFlipDirection();
    } else {
      focusedCellIndex = index;
      focusedCellIndexHistory = [
        index,
        ...focusedCellIndexHistory.slice(0, numberOfStatesInHistory)
      ]
      focusedCellIndexHistoryIndex = 0
    }
  };

  const onFocusNextCell = () => {
    let nextCell = getCellAfterDiff({
      diff: 1,
      cells,
      direction: focusedDirection,
      focusedCell,
    });
    if (!nextCell) {
      nextCell = getCellAfterDiff({
        diff: 1,
        cells,
        direction: focusedDirection,
        focusedCell: {
          x: focusedDirection == "across" ? -1 : focusedCell.x + 1,
          y: focusedDirection == "down" ? -1 : focusedCell.y + 1,
        },
      });
    }
    if (!nextCell) return;
    onFocusCell(nextCell.index);
  };

  const onFocusClueDiff = (diff=1) => {
    const currentNumber = focusedCell.clueNumbers[focusedDirection]
    let nextCluesInDirection = clues.filter(clue => (
      (
        diff > 0
        ? clue.number > currentNumber
        : clue.number < currentNumber
      ) && clue.direction == focusedDirection
    ))
    if (diff < 0) {
      nextCluesInDirection = nextCluesInDirection.reverse()
    }
    let nextClue = nextCluesInDirection[Math.abs(diff) - 1]
    if (!nextClue) {
      onFlipDirection()
      nextClue = clues.filter(clue => (
        clue.direction == focusedDirection
      ))[0]
    }
    focusedCellIndex = cells.findIndex(cell => (
      cell.x == nextClue.x
      && cell.y == nextClue.y
    ))
  }

  const onMoveFocus = (direction, diff) => {
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
  };

  const onFlipDirection = () => {
    focusedDirection = {
      across: "down",
      down: "across",
    }[focusedDirection];
  };
</script>

<section class="puzzle">
  <svg viewBox="0 0 {w} {h}" style="max-width: {w * 150}px">
    <!-- svg -->
    {#each cells as { x, y, value, index, number }}
      <Cell
        x="{x}"
        y="{y}"
        index="{index}"
        value="{value}"
        number="{number}"
        isFocused="{focusedCellIndex == index}"
        isSecondarilyFocused="{secondarilyFocusedCells.includes(index)}"
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
    flex: 3;
    --dark-color: #3d3d3d;
  }
  svg {
    display: block;
    fill: var(--dark-color, #000);
    border: 4px solid var(--dark-color, #000);
    background: var(--dark-color, #000);
    font-size: 1px;
    font-family: sans-serif;
  }
</style>
