<script>
  export let number;
  export let clue;
  export let isNumberFocused = false;
  export let isDirectionFocused = false;
  export let onFocus = () => {};
</script>

<button
  class="clue"
  class:is-number-focused="{isNumberFocused}"
  class:is-direction-focused="{isDirectionFocused}"
  on:click="{onFocus}">
  {number}.
  {clue}
</button>

<style>
  .clue {
    display: block;
    width: 100%;
    background: none;
    text-align: left;
    appearance: none;
    outline: none;
    border: 1px solid transparent;
    border-left: 6px solid transparent;
    padding: 0.6em 1em;
    cursor: pointer;
  }
  .clue:focus {
    border-color: #e0d8ff;
  }
  .is-number-focused {
    border-left-color: #e0d8ff;
  }
  .is-number-focused.is-direction-focused {
    background: #e0d8ff;
  }
</style>
