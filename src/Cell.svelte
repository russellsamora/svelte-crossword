<script>
  import { getContext } from "svelte";

  const { data, onCellUpdate } = getContext("Crossword");

  export let coords = [0, 0]
  export let value = ""
  export let index = 0

  const onKeydown = e => {
    const isInAlphabet = !/^[a-zA-Z()]$/.test(e.key)
    if (isInAlphabet) return
    onCellUpdate(coords, e.key.toUpperCase())
  }
</script>

<g transform={`translate(${coords[0]}, ${coords[1]})`} tabIndex="0" on:keydown={onKeydown}>
  <rect width="1" height="1" />
  <text class="value" x="0.5" y="0.5">{value}</text>
  <text class="index" x="0.1" y="0.1">{index}</text>
</g>

<style>
  g:focus {
    outline: none;
  }
  g:focus rect {
    fill: #DFF9FB;
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