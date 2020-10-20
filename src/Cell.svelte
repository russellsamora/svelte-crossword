<script>
  import { getContext } from "svelte";

  const { data, onCellUpdate } = getContext("Crossword");

  export let coords = [0, 0]
  export let value = ""

  const onKeydown = e => {
    const isInAlphabet = !/^[a-zA-Z()]$/.test(e.key)
    if (isInAlphabet) return
    onCellUpdate(coords, e.key.toUpperCase())
  }
</script>

<g transform={`translate(${coords[0]}, ${coords[1]})`} tabIndex="0" on:keydown={onKeydown}>
  <rect width="1" height="1" />
  <text x="0.5" y="0.5">{value}</text>
</g>

<style>
  g:focus {
    outline: none;
  }
  g:focus rect {
    fill: #DFF9FB;
  }
  text {
    font-weight: 700;
    text-anchor: middle;
    dominant-baseline: central;
  }
  rect {
    fill: none;
    stroke: black;
    stroke-width: 0.005;
  }
</style>