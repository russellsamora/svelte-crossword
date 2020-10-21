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
    flex: 0 1 16em;
    margin-right: 1em;
  }
</style>
