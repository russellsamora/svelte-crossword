<script>
  export let x;
  export let y;
  export let value = "";
	export let number;
	export let index;
	export let isFocused = false;
	export let isSecondarilyFocused = false;
	export let onFocusCell = () => {};
	export let onCellUpdate = () => {};
	export let onFocusNextCell = () => {};

  const onKeydown = e => {
    if (!isFocused) return false;
    if (e.ctrlKey) return false;
    if (e.altKey) return false;

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
  class:is-secondarily-focused={isSecondarilyFocused}
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
    user-select: none;
  }
  g:focus {
    outline: none;
  }
  g.is-secondarily-focused rect {
    fill:#e0d8ff;
  }
  g.is-focused rect {
    fill: #978df0;
  }
  rect {
    transition: fill 0.1s ease-out;
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
