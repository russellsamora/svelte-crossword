<script>
  import Clue from "./Clue.svelte";

  export let direction;
  export let clues;
  export let focusedClueNumbers;
  export let isDirectionFocused;
  export let onClueFocus;
</script>

<p>{direction}</p>
<div class="list">
  <ul>
    {#each clues as clue}
      <Clue
        clue="{clue.clue}"
        number="{clue.number}"
        isFilled="{clue.isFilled}"
        isNumberFocused="{focusedClueNumbers[direction] === clue.number}"
        isDirectionFocused="{isDirectionFocused}"
        onFocus="{() => onClueFocus(clue)}" />
    {/each}
  </ul>
</div>

<style>
  .list {
    position: relative;
    max-height: 45vh;
    margin-bottom: 2em;
    overflow: auto;
  }

  p {
    font-family: var(--clue-text-font);
    color: var(--clue-text-color);
    font-weight: 700;
    text-transform: uppercase;
    padding-left: calc(0.5em + 6px);
    padding-bottom: 0.5em;
    margin: 0;
  }

  ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
    margin-top: 1em;
  }

  ::-moz-scrollbar {
    width: 9px;
  }
  ::-webkit-scrollbar {
    width: 9px;
  }

  ::-moz-scrollbar-track {
    box-shadow: none;
    border-radius: 10px;
    background: var(--clue-scrollbar-bg);
  }
  ::-webkit-scrollbar-track {
    box-shadow: none;
    border-radius: 10px;
    background: var(--clue-scrollbar-bg);
  }
  ::scrollbar-thumb {
    border-radius: 10px;
    background: var(--clue-scrollbar-fg);
    box-shadow: none;
  }
  ::-moz-scrollbar-thumb {
    background: var(--clue-scrollbar-fg);
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--clue-scrollbar-fg);
    border-radius: 6px;
  }
</style>
