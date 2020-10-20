<script>
  import { setContext } from "svelte";
  import { writable, derived } from "svelte/store";

  export let data = null;

  $: context = {
    data,
  };

  $: setContext("Crossword", context);
</script>

<style>
  svg {
    display: block;
    width: 100%;
  }
</style>

<svg viewBox="0 0 100 100">
  <g />
</svg>
