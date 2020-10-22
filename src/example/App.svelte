<script>
  import { Crossword } from "../index.js";
  import dataNYT from "./data-nyt.json";
  import dataOreo from "./data-oreo.json";
  import dataUSA from "./data-usa.json";
	
	let revealedUSA;

</script>

<h1>Svelte Crossword Example: NYT Mini</h1>

<!-- <button on:click={reset}>Reset</button> -->

<Crossword data="{dataNYT}" />

<h1>Svelte Crossword Example: Oreos</h1>

<Crossword data="{dataOreo}" />

<h1>Svelte Crossword Example: USA Today people</h1>

<div class:is-revealed={revealedUSA}>
<Crossword data="{dataUSA}" bind:revealed={revealedUSA} />
</div>

<style>
  h1 {
    margin-top: 3rem;
  }
</style>
