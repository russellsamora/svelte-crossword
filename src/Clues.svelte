<script>
  import Clue from "./Clue.svelte"

  export let clues
  export let focusedCellIndex
  export let focusedCell
  export let focusedDirection
  export let cells

  $: focusedClueNumbers = focusedCell["clueNumbers"] || {}

  const onClueFocus = clue => {
    console.log('onClueFocus', clue, cells)
    focusedDirection = clue.direction
    focusedCellIndex = cells.findIndex(cell => (
      clue.x == cell.x
      && clue.y == cell.y
    ))
  }
</script>

<style>
  section {
    flex: 0 1 16em;
    margin-right: 1em;
  }
</style>

<section class='clues'>
  {#each ["across", "down"] as direction}
    <div class="list">
      <p>{direction}</p>
      {#each clues.filter((d) => d.direction == direction) as clue}
        <Clue
          clue={clue.clue}
          number={clue.number}
          isNumberFocused={focusedClueNumbers[direction] == clue.number}
          isDirectionFocused={focusedDirection == direction}
          onFocus={() => onClueFocus(clue)}
        />
      {/each}
    </div>
  {/each}
</section>
