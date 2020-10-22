<script>
  export let number;
  export let clue;
  export let isNumberFocused = false;
  export let isDirectionFocused = false;
  export let onFocus = () => {};
</script>

<li><button
  class="clue"
  class:is-number-focused="{isNumberFocused}"
  class:is-direction-focused="{isDirectionFocused}"
  on:click="{onFocus}">
  {number}. {clue}
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
    border: 1px solid transparent;
    border-left: 6px solid transparent;
    padding: 0.5em;
    cursor: pointer;
		line-height: 1.325;
		color: var(--clue-text-color, #1a1a1a);
		font-family: var(--clue-font, -apple-system, Helvetica, sans-serif);
		font-size: 1em;
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
</style>
