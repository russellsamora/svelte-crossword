<script>
  import Puzzle from "./Puzzle.svelte";
  import Clues from "./Clues.svelte";
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";
	import {clues} from './stores.js';
  import addClueNumber from "./helpers/addClueNumber.js";

  export let data = [];

  $: data, clues.set(addClueNumber(data))
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
