<script>
  export let x;
  export let y;
  export let value;
  export let number;
  export let index;
	export let custom;
  export let isFocused = false;
  export let isSecondarilyFocused = false;
  export let onFocusCell = () => {};
  export let onCellUpdate = () => {};
  export let onFocusClueDiff = () => {};
  export let onMoveFocus = () => {};
  export let onFlipDirection = () => {};
  export let onHistoricalChange = () => {};

  let element;

  const onFocusSelf = () => {
    if (!element) return;
    if (isFocused) element.focus();
  };

  $: isFocused, onFocusSelf();

  const onKeydown = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() == "z") {
      onHistoricalChange(e.shiftKey ? 1 : -1)
    }

    if (e.ctrlKey) return;
    if (e.altKey) return;

    if (e.key === "Tab") {
      onFocusClueDiff(e.shiftKey ? -1 : 1);
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (e.key == " ") {
      onFlipDirection();
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (["Delete", "Backspace"].includes(e.key)) {
      onCellUpdate(index, "", -1);
      return;
    }

    const isKeyInAlphabet = /^[a-zA-Z()]$/.test(e.key);
    if (isKeyInAlphabet) {
      onCellUpdate(index, e.key.toUpperCase());
      return;
    }

    const diff = {
      ArrowLeft: ["across", -1],
      ArrowRight: ["across", 1],
      ArrowUp: ["down", -1],
      ArrowDown: ["down", 1],
    }[e.key];
    if (diff) {
      onMoveFocus(...diff);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };
  const onClick = () => {
    onFocusCell(index);
  };
</script>

<!-- <svelte:window on:keydown={onKeydown} /> -->

<g
	class="cell {custom ? `cell--${custom}` : ""}"
  class:is-focused="{isFocused}"
  class:is-secondarily-focused="{isSecondarilyFocused}"
  transform="{`translate(${x}, ${y})`}"
  id="cell-{x}-{y}"
  dominant-baseline="central"
  tabIndex="0"
  on:click="{onClick}"
  on:keydown="{onKeydown}"
  bind:this="{element}">
  <rect width="1" height="1"></rect>
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
    fill: #e0d8ff;
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
