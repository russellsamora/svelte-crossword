export default function createCells(data) {
	const cells = data.map((d) => {
		const chars = d.answer.split("");
		return chars.map((value, i) => {
			const x = d.x + (d.direction === "across" ? i : 0);
			const y = d.y + (d.direction === "down" ? i : 0);
			const index = i === 0 ? d.index : "";
			const id = `${x}${y}`;
			return { id, index, x, y, value };
		});
	});
  
	const flat = [].concat(...cells);
	let dict = {};
	
	// sort so that ones with index values come first and dedupe
	flat.sort((a, b) => a.y - b.y || a.x - b.x || b.index - a.index);
	flat.forEach(d => {
		if (!dict[d.id]) dict[d.id] = d;
	});

	const output = Object.keys(dict).map(d => dict[d]);
	return output;
}
