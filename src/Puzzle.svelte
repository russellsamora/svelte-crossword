<script>
  import { getContext } from "svelte";

  import Cell from "./Cell.svelte";

  const { cells } = getContext("Crossword");

  const w = Math.max(...$cells.map((d) => d.x)) + 1;
  const h = Math.max(...$cells.map((d) => d.y)) + 1;
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
  <svg viewBox="0 0 {w} {h}">
    <!-- svg -->
    {#each $cells || [] as { x, y, value }, index}
      <Cell {x} {y} {index} {value} />
    {/each}
  </svg>
</section>
