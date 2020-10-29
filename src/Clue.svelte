<script>
  import scrollTo from "./helpers/scrollTo.js";

  export let number;
  export let clue;
  export let custom;
  export let isFilled;
  export let isNumberFocused = false;
  export let isDirectionFocused = false;
  export let onFocus = () => {};

  let element;

  $: isFocused = isNumberFocused;
</script>

<li bind:this="{element}" use:scrollTo="{isFocused}">
  <button
    class="clue {custom}"
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
    color: var(--clue-text-color);
    font-family: var(--clue-text-font);
    font-size: 1em;
    cursor: pointer;
  }
  .clue:focus {
    border-color: var(--secondary-color);
  }
  .is-number-focused {
    border-left-color: var(--secondary-color);
  }
  .is-number-focused.is-direction-focused {
    background: var(--secondary-color);
  }
  .is-filled {
    opacity: 0.33;
  }
</style>
