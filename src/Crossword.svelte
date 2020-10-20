<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";

  export let data = null;

  $: context = {
    data,
  };

  $: setContext("Crossword", context);
</script>

<style>
</style>

<article>
  <Puzzle />
  <Clues />
</article>
