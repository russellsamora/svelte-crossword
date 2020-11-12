<script>
  export let x;
  export let y;
  export let value;
  export let answer;
  export let number;
  export let index;
  export let custom;
  export let changeDelay = 0;
  export let isRevealing = false;
  export let isChecking = false;
  export let isFocused = false;
  export let isSecondarilyFocused = false;
  export let onFocusCell = () => {};
  export let onCellUpdate = () => {};
  export let onFocusClueDiff = () => {};
  export let onMoveFocus = () => {};
  export let onFlipDirection = () => {};
  export let onHistoricalChange = () => {};

  let element;

  $: isFocused, onFocusSelf();
  $: correct = answer === value;
  $: showCheck = isChecking && value;

  function onFocusSelf() {
    if (!element) return;
    if (isFocused) element.focus();
  }

  function onKeydown(e) {
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
      onCellUpdate(index, "", -1, true);
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
  }

  function onClick() {
    onFocusCell(index);
  }

  function pop(node, { delay = 0, duration = 250 }) {
    return {
      delay,
      duration,
      css: (t) =>
        [
          `transform: translate(0, ${1 - t}px)`, //
        ].join(";"),
    };
  }
</script>

<g
  class="cell {custom} cell-{x}-{y}"
  class:is-focused="{isFocused}"
  class:is-secondarily-focused="{isSecondarilyFocused}"
  class:is-correct="{showCheck && correct}"
  class:is-incorrect="{showCheck && !correct}"
  transform="{`translate(${x}, ${y})`}"
  tabIndex="0"
  on:click="{onClick}"
  on:keydown="{onKeydown}"
  bind:this="{element}">
  <rect width="1" height="1"></rect>

  {#if showCheck && !correct}
    <line x1="0" y1="1" x2="1" y2="0"></line>
  {/if}

  {#if value}
    <text
      transition:pop="{{ y: 5, delay: changeDelay, duration: isRevealing ? 250 : 0 }}"
      class="value"
      x="0.5"
      y="0.9"
      text-anchor="middle">
      {value}
    </text>
  {/if}
  <text class="number" x="0.08" y="0.3" text-anchor="start">{number}</text>
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
    fill: var(--secondary-highlight-color);
  }

  g.is-focused rect {
    fill: var(--primary-highlight-color);
  }

  text {
    pointer-events: none;
    line-height: 1;
    font-family: var(--font);
    fill: var(--main-color);
  }

  .value {
    font-size: 0.7em;
    font-weight: 400;
  }

  .number {
    font-size: 0.3em;
    font-weight: 400;
    fill: var(--main-color);
    opacity: 0.5;
  }

  rect {
    fill: var(--bg-color);
    stroke: var(--main-color);
    stroke-width: 0.01em;
    transition: fill 0.1s ease-out;
  }

  line {
    stroke: var(--main-color);
    stroke-width: 0.02em;
  }
</style>
