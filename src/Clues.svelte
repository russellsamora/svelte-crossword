<script>
  import { getContext } from "svelte";

  const { data } = getContext("Crossword");

  $: console.log($data);
</script>

<section>
  <p>Across</p>
  <p>Down</p>
</section>
