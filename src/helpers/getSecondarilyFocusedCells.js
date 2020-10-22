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
    }));
    
	cellsWithDiff.sort((a, b) => a.diff - b.diff);

  // highlight all cells in same row/column, without any breaks
  const diffs = cellsWithDiff.map((d) => d.diff);
  const indices = range(Math.min(...diffs), Math.max(...diffs)).map((i) =>
    diffs.includes(i) ? i : " "
  );
  const chunks = indices.join(",").split(", ,");
  const currentChunk = (
    chunks.find(
      (d) => d.startsWith("0,") || d.endsWith(",0") || d.includes(",0,")
    ) || ""
  )
    .split(",")
    .map((d) => +d);

  const secondarilyFocusedCellIndices = cellsWithDiff
    .filter((cell) => currentChunk.includes(cell.diff))
    .map((cell) => cell.index);
  return secondarilyFocusedCellIndices;
};

const range = (min, max) =>
  Array.from({ length: max - min + 1 }, (v, k) => k + min);
