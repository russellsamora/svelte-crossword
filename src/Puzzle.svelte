<script>
  import { cells } from "./stores";

  import Cell from "./Cell.svelte";

  const w = Math.max(...$cells.map((d) => d.x)) + 1;
  const h = Math.max(...$cells.map((d) => d.y)) + 1;
</script>

<style>
  section {
    flex: 3;
    --dark-color: #222;
  }
  svg {
    display: block;
    fill: var(--dark-color, #000);
    border: 4px solid var(--dark-color, #000);
    background: var(--dark-color, #000);
    font-size: 1px;
    font-family: sans-serif;
  }
</style>

<section class='puzzle'>
  <svg viewBox="0 0 {w} {h}">
    <!-- svg -->
    {#each $cells || [] as { x, y, value, index, number }}
      <Cell {x} {y} {index} {value} {number} />
    {/each}
  </svg>
</section>
