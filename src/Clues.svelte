<script>
  import { getContext } from "svelte";

  const { data } = getContext("Crossword");

  $: console.log($data);
  $: across = $data.filter(d => d["direction"] == "across")
  $: down = $data.filter(d => d["direction"] == "down")
</script>

<section>

  <p>Across</p>
  {#each across as {clue, x}}
    <div class="clue">{x}. {clue}</div>
  {/each}

  <p>Down</p>
  {#each down as {clue, y}}
    <div class="clue">{y}. {clue}</div>
  {/each}

</section>

<style>
section {
  padding: 2em;
}
</style>