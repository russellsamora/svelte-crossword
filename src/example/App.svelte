<script>
  import Crossword from "../Crossword.svelte";
  import dataNYT from "./data-nyt.json";
  import dataOreo from "./data-oreo.json";
  import dataAmelia from "./data-amelia.json";
  import dataUSA from "./data-usa.json";

  let revealedUSA;
</script>

<article>
  <section class="nyt">
    <h1>NYT Mini</h1>
    <p>Default options.</p>
    <Crossword data="{dataNYT}" />
  </section>

  <section class="amelia">
    <h1>Oreo</h1>
    <p>Custom themes</p>
    <select>
      <option>Classic</option>
      <option>Dark</option>
      <option>Amelia</option>
    </select>
    <Crossword data="{dataOreo}" theme="oreo" />
  </section>

  <section class:is-revealed="{revealedUSA}" class="usa">
    <h1>People in USA Today puzzles</h1>
    <p>Custom class name on cells.</p>
    <Crossword data="{dataUSA}" bind:revealed="{revealedUSA}" />
  </section>
</article>

<style>
  article {
    font-family: sans-serif;
  }
  section {
    max-width: 960px;
    margin: 5em auto;
  }
  h1 {
    margin: 0;
    font-size: 2em;
    max-width: 640px;
  }
  p {
    max-width: 640px;
    margin: 1em 0;
  }
</style>
