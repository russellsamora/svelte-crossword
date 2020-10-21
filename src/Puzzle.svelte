<script>
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
    const dimension = focusedDirection == "across" ? "x" : "y"
    const otherDimension = focusedDirection == "across" ? "y" : "x"
    const start = focusedCell[dimension]

    const cellsWithDiff = cells.filter(cell => (
      // take out cells in other columns/rows
      cell[otherDimension] == focusedCell[otherDimension]
    )).map(cell => ({
      ...cell,
      // how far is this cell from our focused cell?
      diff: start - cell[dimension],
    })).sort((a,b) => a["diff"] - b["diff"])

    // highlight all cells in same row/column, without any breaks
    let runningDiff = 0
    let firstConsecutiveDiffIndex = 0
    let lastConsecutiveDiffIndex = 0
    let isInStreak = true
    cellsWithDiff.forEach(({ diff }, i) => {
      if (diff - runningDiff < 2) {
        if (!isInStreak && i > 0) {
          return
        }
        lastConsecutiveDiffIndex = i
        runningDiff = diff
        if (!isInStreak) firstConsecutiveDiffIndex = i
        isInStreak = true
      } else {
        isInStreak = false
      }
    })
    secondarilyFocusedCells = cellsWithDiff
      .slice(firstConsecutiveDiffIndex, lastConsecutiveDiffIndex + 1)
      .map(cell => cell.index)
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
      focusedDirection = {
        "across": "down",
        "down": "across",
      }[focusedDirection]
    } else {
      focusedCellIndex = index;
    }
  };

  const onFocusNextCell = () => {
    onFocusCell(focusedCellIndex + 1);
  };

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
      />
    {/each}
  </svg>
</section>
