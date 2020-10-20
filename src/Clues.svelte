<script>
  import { getContext } from "svelte";

  const { data } = getContext("Crossword");

  $: across = $data.filter((d) => d["direction"] == "across");
  $: down = $data.filter((d) => d["direction"] == "down");
</script>

<style>
  section {
    padding: 2em;
  }
</style>

<section>
  <p>Across</p>
  {#each across as { clue, x }}
    <div class="clue">{x}. {clue}</div>
  {/each}

  <p>Down</p>
  {#each down as { clue, y }}
    <div class="clue">{y}. {clue}</div>
  {/each}
</section>
