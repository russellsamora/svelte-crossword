<script>
  export let number
  export let clue
  export let isNumberFocused = false
  export let isDirectionFocused = false
  export let onFocus = () => {}
</script>

<button
  class="clue"
  class:is-number-focused={isNumberFocused}
  class:is-direction-focused={isDirectionFocused}
  on:click={onFocus}>
  {number}. {clue}
</button>

<style>
  .clue {
    display: block;
    background: none;
    text-align: left;
    appearance: none;
    outline: none;
    border: 1px solid transparent;
    padding: 0.6em 1em;
    cursor: pointer;
  }
  .clue:focus {
    border-color: skyblue;
  }
  .is-number-focused {
    border-left: 2px solid skyblue;
  }
  .is-number-focused.is-direction-focused {
    background: skyblue
  }
</style>