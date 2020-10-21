<script>
  import { clues } from "./stores";

  $: across = $clues.filter((d) => d.direction == "across");
  $: down = $clues.filter((d) => d.direction == "down");
</script>

<style>
  section {
    flex: 0 1 16em;
  }
</style>

<section class='clues'>
  <p>Across</p>
  {#each across as { clue, number }}
    <div class="clue">{number}. {clue}</div>
  {/each}

  <p>Down</p>
  {#each down as { clue, number }}
    <div class="clue">{number}. {clue}</div>
  {/each}
</section>
