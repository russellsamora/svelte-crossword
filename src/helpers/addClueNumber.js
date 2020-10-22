export default function addClueNumber(data) {
  // add x/y end coords
  const withId = data.map((d) => ({
		...d,
    id: `${d.x}-${d.y}`,
  }));

  // sort asc by start position of clue so we have proper clue ordering
  withId.sort((a, b) => a.y - b.y || a.x - b.x);

  // create a lookup to store clue number (and reuse if same start pos)
  let lookup = {};
  let currentNumber = 1;

  const withNumber = withId.map((d) => {
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