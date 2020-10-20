<script>
  import { getContext } from "svelte";

  import Cell from "./Cell.svelte"

  const { data, cells } = getContext("Crossword");

  const numberOfRows = 3
  const numberOfColumns = 3
</script>

<style>
  svg {
    display: block;
    border: 4px solid #000;
    font-size: 1px;
    font-family: sans-serif;
  }
</style>

<section>
  <svg viewBox="0 0 {numberOfRows} {numberOfColumns}">
    <!-- svg -->
    {#each $cells || [] as {coords, value}, i}
      <Cell {coords} {value} index={i + 1} />
    {/each}
  </svg>
</section>
