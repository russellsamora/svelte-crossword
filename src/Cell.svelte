<script>
  import { getContext } from "svelte";

  const { data, focusedCell, onCellUpdate, onFocusCell, onFocusNextCell } = getContext("Crossword");

  export let x;
  export let y;
  export let value = "";
  export let index = 0;

  $: isFocused = $focusedCell["index"] == index

  const onKeydown = e => {
    if (!isFocused) return
    if (e.key == "Tab") {
      onFocusNextCell()
      e.preventDefault()
      e.stopPropagation()
      return
    }
    const isKeyInAlphabet = !/^[a-zA-Z()]$/.test(e.key)
    if (isKeyInAlphabet) return
    onCellUpdate(index, e.key.toUpperCase())
  }
  const onClick = () => {
    onFocusCell(index)
  }
</script>

<svelte:window on:keydown={onKeydown} />

<g
  class:is-focused={isFocused}
  transform={`translate(${x}, ${y})`}
  on:click={onClick}
  id="cell-{x}-{y}">
  <rect width="1" height="1" />
  <text class="value" x="0.5" y="0.5">{value}</text>
  <text class="index" x="0.1" y="0.1">{index}</text>
</g>

<style>
  g {
    cursor: pointer;
  }
  g:focus {
    outline: none;
  }
  g.is-focused rect {
    fill: #e1d6f1;
  }
  text {
    pointer-events: none;
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
    fill: white;
    stroke: var(--dark-color, #000);
    stroke-width: 0.005;
  }
</style>
