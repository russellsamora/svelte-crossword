export default function createCells(data) {
	const withCells = data.map(d => {
		const chars = d.answer.split("");
		const cells = chars.map((value, i) => ({
			x: d.x + (d.direction === "across" ? i : 0),
			y: d.y + (d.direction === "down" ? i : 0),
			value
		}));
		return cells;
	});

	
	const flat = [].concat(...withCells);
	return flat;
}