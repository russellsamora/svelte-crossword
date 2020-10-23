export default function createClues(data) {
  const withId = data.map((d, i) => ({
		...d,
		index: i,
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


	// create cells for each letter
	const withCells = withNumber.map(d => {
		const chars = d.answer.split("");
    const cells = chars.map((answer, i) => {
      const x = d.x + (d.direction === "across" ? i : 0);
      const y = d.y + (d.direction === "down" ? i : 0);
      const number = i === 0 ? d.number : "";
      const clueNumbers = { [d.direction]: d.number };
      const id = `${x}-${y}`;
      const value = "";
      const custom = d.custom || "";
      return {
        id,
        number,
        clueNumbers,
        x,
        y,
        value,
        answer: answer.toUpperCase(),
        custom,
      };
    });
		return {
			...d,
			cells
		}
	});

	withCells.sort((a, b) => a.number - b.number);

	return withCells;
}