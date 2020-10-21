<script>
  import Clue from "./Clue.svelte";

  export let clues;
  export let cellIndexMap;
  export let focusedDirection;
  export let focusedCellIndex;
  export let focusedCell;

  $: focusedClueNumbers = focusedCell["clueNumbers"] || {};

  const onClueFocus = (clue) => {
    focusedDirection = clue.direction;
    const cellId = [clue.x, clue.y].join("-");
    focusedCellIndex = cellIndexMap[cellId] || 0;
  };
</script>

<section class="clues">
  {#each ['across', 'down'] as direction}
    <div class="list">
      <p>{direction}</p>
      {#each clues.filter((d) => d.direction == direction) as clue}
        <Clue
          clue="{clue.clue}"
          number="{clue.number}"
          isNumberFocused="{focusedClueNumbers[direction] == clue.number}"
          isDirectionFocused="{focusedDirection == direction}"
          onFocus="{() => onClueFocus(clue)}" />
      {/each}
    </div>
  {/each}
</section>

<style>
  section {
    position: sticky;
    top: 1em;
    flex: 0 1 16em;
    height: fit-content;
    margin-right: 1em;
  }
  .list {
    max-height: 45vh;
    margin-bottom: 2em;
    overflow: auto;
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
    background: #f4f4f4;
  }
  ::-webkit-scrollbar-track {
    box-shadow: none;
    border-radius: 10px;
    background: #f4f4f4;
  }
  ::scrollbar-thumb {
    border-radius: 10px;
    background: #ddd;
    box-shadow: none;
  }
  ::-moz-scrollbar-thumb {
    background: #ddd;
    border-radius: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 6px;
  }
</style>
