import classic from "../themes/classic.js";
import dark from "../themes/dark.js";
import citrus from "../themes/citrus.js";

const themes = { classic, dark, citrus };

Object.keys(themes).forEach((t) => {
	themes[t] = Object.keys(themes[t])
		.map((d) => `--${d}: var(--xd-${d}, ${themes[t][d]})`)
		.join(";");
});

export default themes;