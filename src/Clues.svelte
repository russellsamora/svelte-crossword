<script>
	import ClueList from "./ClueList.svelte";
	import ClueBar from "./ClueBar.svelte";

  export let clues;
  export let cellIndexMap;
  export let focusedDirection;
  export let focusedCellIndex;
  export let focusedCell;

	$: focusedClueNumbers = focusedCell.clueNumbers || {};
	$: currentClue = clues.find(c => c.direction === focusedDirection && c.number === focusedClueNumbers[focusedDirection]);

  function onClueFocus({ direction, id }) {
    focusedDirection = direction;
    focusedCellIndex = cellIndexMap[id] || 0;
	}
	
</script>

<section class="clues">
	<div class="desktop">
  {#each ['across', 'down'] as direction}
    <ClueList
      direction="{direction}"
      focusedClueNumbers="{focusedClueNumbers}"
      clues="{clues.filter((d) => d.direction === direction)}"
      isDirectionFocused="{focusedDirection === direction}"
      onClueFocus="{onClueFocus}" />
	{/each}
	</div>
	<div class="mobile">
		<ClueBar {currentClue} />
	</div>
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
