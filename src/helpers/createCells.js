export default function createCells(data) {
  let populatedCellCoords = [];

  const withCells = data.map((d) => {
    const chars = d.answer.split("");
    const cells = chars.map((value, i) => {
      const x = d.x + (d.direction === "across" ? i : 0);
      const y = d.y + (d.direction === "down" ? i : 0);
      const coordsString = [x, y].join(", ");
      if (populatedCellCoords.includes(coordsString)) return null;
      populatedCellCoords.push(coordsString);
      return { x, y, value };
    });
    return cells;
  });

  const flat = []
    .concat(...withCells)
    .filter((d) => d)
    .sort((a, b) => a["y"] - b["y"] || a["x"] - b["x"])
    .map((d, index) => ({ ...d, index: index + 1 }));
  return flat;
}
