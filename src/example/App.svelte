<script>
  import { Crossword } from "../index.js";
  import dataNYT from "./data-nyt.json";
  import dataOreo from "./data-oreo.json";
  import dataUSA from "./data-usa.json";
</script>

<h1>Svelte Crossword Example: NYT Mini</h1>

<!-- <button on:click={reset}>Reset</button> -->

<Crossword data="{dataNYT}" />

<h1>Svelte Crossword Example: Oreos</h1>

<Crossword data="{dataOreo}" />

<h1>Svelte Crossword Example: USA Today people</h1>

<Crossword data="{dataUSA}" />

<style>
  h1 {
    margin-top: 3rem;
  }
</style>
