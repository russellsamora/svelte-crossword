<script>
  import getSecondarilyFocusedCells from "./helpers/getSecondarilyFocusedCells.js";
  import getCellAfterDiff from "./helpers/getCellAfterDiff.js";

  import Cell from "./Cell.svelte";

  export let clues
  export let cells
  export let focusedDirection
  export let focusedCellIndex
  export let focusedCell

  const w = Math.max(...cells.map((d) => d.x)) + 1;
  const h = Math.max(...cells.map((d) => d.y)) + 1;

  let secondarilyFocusedCells = []
  const updateSecondarilyFocusedCells = () => {
    secondarilyFocusedCells = getSecondarilyFocusedCells({
      cells,
      focusedDirection,
      focusedCell,
    })
  }
  $: cells, focusedCellIndex, focusedDirection, updateSecondarilyFocusedCells()

  const onCellUpdate = (index, newValue) => {
    cells = [
      ...cells.slice(0, index),
      { ...cells[index], value: newValue },
      ...cells.slice(index + 1),
    ];

    // // TODO why? seems hacky
    // it for some reason iterates through all cells
    // was a quick fix but needs more digging
    setTimeout(() => {
      onFocusNextCell();
    });
  };

  const onFocusCell = (index) => {
    if (index == focusedCellIndex) {
      onFlipDirection()
    } else {
      focusedCellIndex = index;
    }
  };

  const onFocusNextCell = () => {
    let nextCell = getCellAfterDiff({
      diff: 1,
      cells,
      direction: focusedDirection,
      focusedCell,
    })
    if (!nextCell) {
      nextCell = getCellAfterDiff({
        diff: 1,
        cells,
        direction: focusedDirection,
        focusedCell: {
          x: focusedDirection == "across" ? -1 : focusedCell.x + 1,
          y: focusedDirection == "down" ? -1 : focusedCell.y + 1,
        },
      })
    }
    if (!nextCell) return
    onFocusCell(nextCell.index);
  };

  const onMoveFocus = (direction, diff) => {
    if (focusedDirection != direction) {
      const dimension = direction == "across" ? "x" : "y";
      focusedDirection = direction
    } else {
      const nextCell = getCellAfterDiff({
        diff,
        cells,
        direction,
        focusedCell,
      })
      if (!nextCell) return
      onFocusCell(nextCell.index);
    }
  };

  const onFlipDirection = () => {
    focusedDirection = {
      "across": "down",
      "down": "across",
    }[focusedDirection]
  }

</script>

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

<section class='puzzle'>
  <svg viewBox="0 0 {w} {h}" style="max-width: {w * 150}px">
    <!-- svg -->
    {#each cells as { x, y, value, index, number }}
      <Cell
        {x}
        {y}
        {index}
        {value}
        {number}
        isFocused={focusedCellIndex == index}
        isSecondarilyFocused={secondarilyFocusedCells.includes(index)}
        {onFocusCell}
        {onCellUpdate}
        {onFocusNextCell}
        {onMoveFocus}
        {onFlipDirection}
      />
    {/each}
  </svg>
</section>
