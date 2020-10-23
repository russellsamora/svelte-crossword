export default function validateClues(data) {
	const props = [
    {
      prop: "clue",
      type: "string",
    },
    {
      prop: "answer",
      type: "string",
    },
    {
      prop: "x",
      type: "number",
    },
    {
      prop: "y",
      type: "number",
    }
  ];

	// only store if they fail
	let failedProp = false;
  data.forEach(d => !!props.map(p => {
		const f = typeof d[p.prop] !== p.type;
		if (f) {
			failedProp = true;
			console.error(`"${p.prop}" is not a ${p.type}\n`, d);
		}
	}));

	let failedCell = false;
	const cells = [].concat(...data.map(d => d.cells));
	
	let dict = {};
	cells.forEach((d) => {
    if (!dict[d.id]) {
      dict[d.id] = d.answer;
    } else {
			if (dict[d.id] !== d.answer) {
				failedCell = true;
				console.error(`cell "${d.id}" has two different values\n`, `${dict[d.id]} and ${d.answer}`);
			}
		}
  });

	return !failedProp && !failedCell;
}