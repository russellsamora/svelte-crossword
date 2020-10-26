export default function createClues(data) {
	// determine if 0 or 1 based
	const minX = Math.min(...data.map(d => d.x));
	const minY = Math.min(...data.map(d => d.y));
	const adjust = Math.min(minX, minY);

	
	const withAdjust = data.map(d => ({
		...d,
		x: d.x - adjust,
		y: d.y - adjust
	}));

  const withId = withAdjust.map((d, i) => ({
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

	withCells.sort((a, b) => {
		if (a.direction < b.direction) return -1;
		else if (a.direction > b.direction) return 1;
		return a.number - b.number;
	});
	const withIndex = withCells.map((d, i) => ({
		...d,
		index: i
	}));
	return withIndex;
}