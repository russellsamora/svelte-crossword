import classic from "../themes/classic.js";
import dark from "../themes/dark.js";
import citrus from "../themes/citrus.js";
import amelia from "../themes/amelia.js";

const themes = { classic, dark, citrus, amelia };
const defaultTheme = themes["classic"];

Object.keys(themes).forEach((t) => {
	themes[t] = Object.keys(defaultTheme)
		.map((d) => `--${d}: var(--xd-${d}, ${themes[t][d] || defaultTheme[d]})`)
		.join(";");
});

export default themes;