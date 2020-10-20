<script>
  import { getContext } from "svelte";

  const { onCellUpdate } = getContext("Crossword");

  export let x;
  export let y;
  export let value = "";
  export let index = 0;

  const onKeydown = (e) => {
    const isInAlphabet = !/^[a-zA-Z()]$/.test(e.key);
    if (isInAlphabet) return;
    onCellUpdate({ x, y, index }, e.key.toUpperCase());
  };
</script>

<style>
  g:focus {
    outline: none;
  }
  g:focus rect {
    fill: #dff9fb;
  }
  text {
    text-anchor: middle;
    dominant-baseline: central;
  }
  .value {
    font-weight: 700;
  }
  .index {
    font-size: 0.1em;
    font-weight: 300;
    opacity: 0.4;
  }
  rect {
    fill: none;
    stroke: black;
    stroke-width: 0.005;
  }
</style>

<g transform={`translate(${x}, ${y})`} tabIndex="0" on:keydown={onKeydown}>
  <rect width="1" height="1" />
  <text class="value" x="0.5" y="0.5">{value}</text>
  <text class="index" x="0.1" y="0.1">{index}</text>
</g>
