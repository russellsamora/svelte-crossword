<script>
  import { focusedCellIndex, onCellUpdate, onFocusCell, onFocusNextCell } from "./stores"

  export let x;
  export let y;
  export let value = "";
	export let number;
	export let index;

  $: isFocused = $focusedCellIndex == index;

  const onKeydown = e => {
    if (!isFocused) return false;

    if (e.key === "Tab") {
      onFocusNextCell();
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const isKeyInAlphabet = !/^[a-zA-Z()]$/.test(e.key);

    if (isKeyInAlphabet) return false;

		onCellUpdate(index, e.key.toUpperCase());
  }
  const onClick = () => {
    onFocusCell(index);
  };

</script>

<svelte:window on:keydown={onKeydown} />

<g
  class:is-focused={isFocused}
  transform={`translate(${x}, ${y})`}
  on:click={onClick}
  id="cell-{x}-{y}"
	dominant-baseline="central"
	>
  <rect width="1" height="1" />
  <text class="value" x="0.5" y="0.5">{value}</text>
	<text class="number" x="0.1" y="0.1">{number}</text>
</g>

<style>
  g {
    cursor: pointer;
  }
  g:focus {
    outline: none;
  }
  g.is-focused rect {
		fill :#a7d8ff;
    fill: #ffda00;
  }
  text {
    pointer-events: none;
    text-anchor: middle;
		line-height: 1;
  }
  .value {
    font-weight: 700;
		/* user-select: none; */
  }
  .number {
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
