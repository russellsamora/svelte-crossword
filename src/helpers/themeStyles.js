import classic from "../themes/classic.js";
import dark from "../themes/dark.js";

const themes = { classic, dark };

Object.keys(themes).forEach((t) => {
	themes[t] = Object.keys(themes[t])
		.map((d) => `--${d}: var(--xd-${d}, ${themes[t][d]})`)
		.join(";");
});

export default themes;