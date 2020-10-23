<script>
  import Clue from "./Clue.svelte";

  export let direction;
  export let clues;
  export let focusedClueNumbers;
  export let isDirectionFocused;
  export let onClueFocus;
</script>

<div class="list">
  <p>{direction}</p>
  <ul>
    {#each clues as clue}
      <Clue
        clue="{clue.clue}"
        number="{clue.number}"
				isFilled="{clue.isFilled}"
        isNumberFocused="{focusedClueNumbers[direction] == clue.number}"
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
    font-family: var(--clue-font, -apple-system, Helvetica, sans-serif);
		color: var(--clue-text-color, #1a1a1a);
		font-weight: 700;
    text-transform: uppercase;
    padding-left: calc(0.5em + 6px);
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
    background: var(--clue-scrollbar-bg, #efefef);
  }
  ::-webkit-scrollbar-track {
    box-shadow: none;
    border-radius: 10px;
    background: var(--clue-scrollbar-bg, #efefef);
  }
  ::scrollbar-thumb {
    border-radius: 10px;
    background: var(--clue-scrollbar-fg, #cdcdcd);
    box-shadow: none;
  }
  ::-moz-scrollbar-thumb {
    background: var(--clue-scrollbar-fg, #cdcdcd);
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--clue-scrollbar-fg, #cdcdcd);
    border-radius: 6px;
  }
</style>
