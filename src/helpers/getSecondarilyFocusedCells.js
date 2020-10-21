export default ({ cells, focusedDirection, focusedCell }) => {
  const dimension = focusedDirection == "across" ? "x" : "y";
  const otherDimension = focusedDirection == "across" ? "y" : "x";
  const start = focusedCell[dimension];

  const cellsWithDiff = cells
    .filter(
      (cell) =>
        // take out cells in other columns/rows
        cell[otherDimension] == focusedCell[otherDimension]
    )
    .map((cell) => ({
      ...cell,
      // how far is this cell from our focused cell?
      diff: start - cell[dimension],
    }))
    .sort((a, b) => a["diff"] - b["diff"]);

  // highlight all cells in same row/column, without any breaks
  // there's a better way to do this, isn't there?
  let runningDiff = 0;
  let firstConsecutiveDiffIndex = 0;
  let lastConsecutiveDiffIndex = 0;
  let isInStreak = true;
  cellsWithDiff.forEach(({ diff }, i) => {
    if (diff - runningDiff < 2) {
      if (!isInStreak && i > 0) {
        return;
      }
      lastConsecutiveDiffIndex = i;
      runningDiff = diff;
      if (!isInStreak) firstConsecutiveDiffIndex = i;
      isInStreak = true;
    } else {
      isInStreak = false;
    }
  });
  return cellsWithDiff
    .slice(firstConsecutiveDiffIndex, lastConsecutiveDiffIndex + 1)
    .map((cell) => cell.index);
};
