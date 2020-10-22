<script>
  import { Crossword } from "../index.js";
  import dataNYT from "./data-nyt.json";
  import dataOreo from "./data-oreo.json";
  import dataAmelia from "./data-amelia.json";
  import dataUSA from "./data-usa.json";

  let revealedUSA;
</script>

<article>
  <section class="nyt">
    <h1>Svelte Crossword Example: NYT Mini</h1>
    <Crossword data="{dataNYT}" />
  </section>

  <section class="oreos">
    <h1>Svelte Crossword Example: Oreos</h1>
    <Crossword data="{dataOreo}" theme="amelia" />
  </section>
  <section class="amelia">
    <h1>Svelte Crossword Example: mystery</h1>
    <Crossword data="{dataAmelia}" theme="amelia" />
  </section>

  <section class:is-revealed="{revealedUSA}" class="usa">
    <h1>Svelte Crossword Example: USA Today people</h1>
    <Crossword data="{dataUSA}" bind:revealed="{revealedUSA}" />
  </section>
</article>

<style>
  article {
    font-family: sans-serif;
  }
  h1 {
    margin-top: 3rem;
    font-size: 2rem;
  }
  section {
    max-width: 960px;
    margin: 0 auto;
  }
</style>
