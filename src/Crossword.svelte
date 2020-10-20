<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
  import createBoard from "helpers/create-board.js";

  // Component parameters
  export let data = [];

  // Store version of parameters to allow for updating (if we want it)
  const _data = writable(null);

  $: _data.set(data);

  // context to share around child components
  $: context = {
    data: _data,
  };

  $: setContext("Crossword", context);

  const puzzle = createBoard(data);
</script>

<style>
</style>

<article>
  <Clues />
  <Puzzle />
</article>
