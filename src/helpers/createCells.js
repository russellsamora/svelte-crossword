export default function createCells(data) {
  const cells = data.map((d) => {
    const chars = d.answer.split("");
    return chars.map((answer, i) => {
      const x = d.x + (d.direction === "across" ? i : 0);
      const y = d.y + (d.direction === "down" ? i : 0);
      const number = i === 0 ? d.number : "";
      const clueNumbers = { [d.direction]: d.number };
      const id = `${x}-${y}`;
			const value = "";
      return { id, number, clueNumbers, x, y, value, answer };
    });
  });

  const flat = [].concat(...cells);
  let dict = {};

  // sort so that ones with number values come first and dedupe
  flat.sort((a, b) => a.y - b.y || a.x - b.x || b.number - a.number);
  flat.forEach((d) => {
    if (!dict[d.id]) {
      dict[d.id] = d;
    } else {
      // consolidate clue numbers for across & down
      dict[d.id]["clueNumbers"] = {
        ...d["clueNumbers"],
        ...dict[d.id]["clueNumbers"],
      };
    }
  });

  const unique = Object.keys(dict).map((d) => dict[d]);
  unique.sort((a, b) => a.y - b.y || a.x - b.x);
  // add index
  const output = unique.map((d, i) => ({ ...d, index: i }));
  return output;
}
