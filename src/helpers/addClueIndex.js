export default function addClueIndex(data) {
  // add x/y end coords
  const withEnds = data.map((d) => {
    const len = d.answer.length;
    const endX = d.x + (d.direction === "across" ? len : 0);
    const endY = d.y + (d.direction === "down" ? len : 0);
    const id = `${d.x}${d.y}`;
    return { ...d, id, endX, endY };
  });

  // sort asc by start position of clue so we have proper clue ordering
  const maxX = Math.max(...withEnds.map((d) => d.endX));
  data.sort((a, b) => a.y * maxX + a.x - (b.y * maxX + b.x));

  // create a lookup to store clue index # (and reuse if same start pos)
  let lookup = {};
  let currentIndex = 1;

  const withIndex = withEnds.map((d) => {
    let index;
    if (lookup[d.id]) index = lookup[d.id];
    else {
      lookup[d.id] = index = currentIndex;
      currentIndex += 1;
    }
    return {
      ...d,
      index,
    };
  });

	return withIndex;
}