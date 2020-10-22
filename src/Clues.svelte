<script>
  import ClueList from "./ClueList.svelte";

  import Clue from "./Clue.svelte";

  export let clues;
  export let cellIndexMap;
  export let focusedDirection;
  export let focusedCellIndex;
  export let focusedCell;

  $: focusedClueNumbers = focusedCell.clueNumbers || {};

  const onClueFocus = (clue) => {
    focusedDirection = clue.direction;
    const cellId = [clue.x, clue.y].join("-");
    focusedCellIndex = cellIndexMap[cellId] || 0;
  };
</script>

<section class="clues">
  {#each ['across', 'down'] as direction}
    <ClueList
      direction="{direction}"
      focusedClueNumbers="{focusedClueNumbers}"
      clues="{clues.filter((d) => d.direction == direction)}"
      isDirectionFocused="{focusedDirection == direction}"
      onClueFocus="{onClueFocus}" />
  {/each}
</section>

<style>
  section {
    position: sticky;
    top: 1em;
    flex: 0 1 var(--clue-list-width, 16em);
    height: fit-content;
    margin: 0 1em;
  }
</style>
