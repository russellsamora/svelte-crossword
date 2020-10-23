export default function createCells(data) {
  const cells = data.map(d => d.cells)
  const flat = [].concat(...cells);
  let dict = {};

  // sort so that ones with number values come first and dedupe
  flat.sort((a, b) => a.y - b.y || a.x - b.x || b.number - a.number);
  flat.forEach((d) => {
    if (!dict[d.id]) {
      dict[d.id] = d;
    } else {
      // consolidate clue numbers for across & down
      dict[d.id].clueNumbers = {
        ...d.clueNumbers,
        ...dict[d.id].clueNumbers,
      };
      // consolidate custom classes
      if (dict[d.id].custom !== d.custom)
        dict[d.id].custom = `${dict[d.id].custom} ${d.custom}`;
    }
  });

  const unique = Object.keys(dict).map((d) => dict[d]);
  unique.sort((a, b) => a.y - b.y || a.x - b.x);
  // add index
  const output = unique.map((d, i) => ({ ...d, index: i }));
  return output;
}
