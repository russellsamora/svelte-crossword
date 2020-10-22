<script>
  export let x;
  export let y;
  export let value;
  export let number;
  export let index;
  export let custom;
  export let changeDelay = 0;
  export let isRevealing = false;
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
      onHistoricalChange(e.shiftKey ? 1 : -1);
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

  const pop = (node, { delay = 0, duration = 200 }) => ({
    delay,
    duration,
    css: (t) =>
      [
        `transform: translate(0, ${1 - t}px)`, //
      ].join(";"),
  });
</script>

<!-- <svelte:window on:keydown={onKeydown} /> -->

<g
  class="cell {custom}"
  class:is-focused="{isFocused}"
  class:is-secondarily-focused="{isSecondarilyFocused}"
  transform="{`translate(${x}, ${y})`}"
  id="cell-{x}-{y}"
  tabIndex="0"
  on:click="{onClick}"
  on:keydown="{onKeydown}"
  bind:this="{element}">
  <rect width="1" height="1"></rect>
  {#if value}
    <text
      transition:pop="{{ y: 6, delay: changeDelay, duration: isRevealing ? 200 : 0 }}"
      class="value"
      x="0.5"
      y="0.9"
      alignment-baseline="baseline"
      text-anchor="middle">
      {value}
    </text>
  {/if}
  <text
    class="number"
    x="0.1"
    y="0.1"
    alignment-baseline="hanging"
    text-anchor="start">
    {number}
  </text>
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
    fill: var(--cell-highlight-color, #ffec99);
  }

  g.is-focused rect {
    fill: var(--cell-secondary-color, #ffcc00);
  }

  rect {
    transition: fill 0.1s ease-out;
  }

  text {
    pointer-events: none;
    line-height: 1;
    fill: var(--cell-text-color, #1a1a1a);
  }

  .value {
    font-size: var(--cell-font-size, 0.7em);
    font-weight: var(--cell-font-weight, 700);
  }

  .number {
    font-size: var(--number-font-size, 0.3em);
    font-weight: var(--number-font-weight, 300);
    fill: var(--number-color, #8a8a8a);
  }

  rect {
    fill: var(--cell-bg-color, #fff);
    stroke: var(--cell-border-color, #1a1a1a);
    stroke-width: var(--cell-border-width, 0.01);
  }
</style>
