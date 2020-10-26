<script>
	import ClueList from "./ClueList.svelte";
	import ClueBar from "./ClueBar.svelte";

  export let clues;
  export let cellIndexMap;
  export let focusedDirection;
  export let focusedCellIndex;
	export let focusedCell;
	export let desktop;

	$: focusedClueNumbers = focusedCell.clueNumbers || {};
	$: currentClue = clues.find(c => c.direction === focusedDirection && c.number === focusedClueNumbers[focusedDirection]);

  function onClueFocus({ direction, id }) {
    focusedDirection = direction;
    focusedCellIndex = cellIndexMap[id] || 0;
	}


	function onNextClue({ detail }) {
		let next = detail;
		if (next < 0) next = clues.length - 1;
		else if (next > clues.length - 1) next = 0;
		const { direction, id } = clues[next];
		onClueFocus({ direction, id });
	}
</script>

<section class="clues" class:desktop>
	<div class="clues--desktop" class:desktop>
  {#each ['across', 'down'] as direction}
    <ClueList
      direction="{direction}"
      focusedClueNumbers="{focusedClueNumbers}"
      clues="{clues.filter((d) => d.direction === direction)}"
      isDirectionFocused="{focusedDirection === direction}"
      onClueFocus="{onClueFocus}" />
	{/each}
	</div>
	<div class="clues--mobile" class:desktop>
		<ClueBar {currentClue} on:nextClue="{onNextClue}" />
	</div>
</section>

<style>
	section.desktop {
			position: sticky;
			top: 1em;
			flex: 0 1 var(--clue-list-width, 16em);
			height: fit-content;
    	margin: 0 1em;
		}
	
	.clues--mobile {
		display: block;
		margin: 2em 0;
	}
	
	.clues--mobile.desktop {
		display: none;
	}
	
	.clues--desktop {
		display: none;
	}
	
	.clues--desktop.desktop {
		display: block;
	}
</style>
