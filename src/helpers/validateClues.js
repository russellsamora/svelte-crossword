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
	let failed = false;
  const failures = data.forEach(d => !!props.map(p => {
		const f = typeof d[p.prop] !== p.type;
		if (f) {
			failed = f;
			console.error(`"${p.prop}" is not a ${p.type}\n`, d);
			return true;
		}
		return false;
	}));
	return !failed;
}