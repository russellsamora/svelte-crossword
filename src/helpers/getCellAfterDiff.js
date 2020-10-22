export default ({ diff, cells, direction, focusedCell }) => {
  const dimension = direction == "across" ? "x" : "y";
  const otherDimension = direction == "across" ? "y" : "x";
  const start = focusedCell[dimension];
  const absDiff = Math.abs(diff);
  const isDiffNegative = diff < 0;

  const cellsWithDiff = cells
    .filter(
      (cell) =>
        // take out cells in other columns/rows
        cell[otherDimension] == focusedCell[otherDimension] &&
        // take out cells in wrong direction
        (isDiffNegative ? cell[dimension] < start : cell[dimension] > start)
    )
    .map((cell) => ({
      ...cell,
      // how far is this cell from our focused cell?
      absDiff: Math.abs(start - cell[dimension]),
    }));

  cellsWithDiff.sort((a, b) => a.absDiff - b.absDiff);
  return cellsWithDiff[absDiff - 1];
};
