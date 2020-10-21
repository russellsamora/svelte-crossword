<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
	import stores from './stores.js';

  export let data = [];

	const context = stores.init(data);

  $: setContext("Crossword", context);
</script>

<style>
  article {
    display: flex;
  }
</style>

<article>
  <Clues />
  <Puzzle />
</article>
