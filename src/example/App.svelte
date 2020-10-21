<script>
  import { Crossword } from "../index.js";
  import data from "./data.json";
	import data2 from "./data2.json";
</script>

<h1>Svelte Crossword Example: NYT Mini</h1>

<Crossword {data} />

<h1>Svelte Crossword Example: Oreos</h1>

<Crossword data={data2} />

<style>
	h1 {
		margin-top: 3rem;
	}
</style>