export default function addClueNumber(data) {
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

  // create a lookup to store clue number (and reuse if same start pos)
  let lookup = {};
  let currentNumber = 1;

  const withNumber = withEnds.map((d) => {
    let number;
    if (lookup[d.id]) number = lookup[d.id];
    else {
      lookup[d.id] = number = currentNumber;
      currentNumber += 1;
    }
    return {
      ...d,
      number,
    };
  });

	withNumber.sort((a, b) => a.number - b.number);

	return withNumber;
}