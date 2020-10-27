<script>
  import scrollTo from "./helpers/scrollTo.js";

  export let number;
  export let clue;
  export let isFilled;
  export let isNumberFocused = false;
  export let isDirectionFocused = false;
  export let onFocus = () => {};

  let element;

  $: isFocused = isNumberFocused;
</script>

<li bind:this="{element}" use:scrollTo="{isFocused}">
  <button
    class="clue"
    class:is-number-focused="{isNumberFocused}"
    class:is-direction-focused="{isDirectionFocused}"
    class:is-filled="{isFilled}"
    on:click="{onFocus}">
    {number}.
    {clue}
  </button>
</li>

<style>
  button {
    display: block;
    width: 100%;
    background: none;
    text-align: left;
    appearance: none;
    outline: none;
    border: none;
    border-left: 6px solid transparent;
    padding: 0.5em;
    cursor: pointer;
    line-height: 1.325;
    color: var(--clue-text-color, #1a1a1a);
    font-family: var(--clue-font, -apple-system, Helvetica, sans-serif);
    font-size: 1em;
    cursor: pointer;
  }
  .clue:focus {
    border-color: var(--cell-highlight-color, #ffec99);
  }
  .is-number-focused {
    border-left-color: var(--cell-highlight-color, #ffec99);
  }
  .is-number-focused.is-direction-focused {
    background: var(--cell-highlight-color, #ffec99);
  }
  .is-filled {
    opacity: 0.33;
  }
</style>
