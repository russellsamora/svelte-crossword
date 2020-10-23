<script>
  import Crossword from "../Crossword.svelte";
  import dataNYT from "./data-nyt.json";
  import dataOreo from "./data-oreo.json";
  import dataAmelia from "./data-amelia.json";
  import dataUSA from "./data-usa.json";

  let revealedUSA;
  let theme;
</script>

<article>
  <section class="nyt">
		<p class="example">Example</p>
    <h1>Default</h1>
    <p>An NYT mini puzzle with all default settings.</p>
    <Crossword data="{dataNYT}" />
  </section>

  <section class="amelia">
		<p class="example">Example</p>
    <h1>Themes</h1>
    <p>A library of preset style themes to choose from.</p>
    <select bind:value="{theme}">
      <option value="classic">Classic</option>
      <option value="dark">Dark</option>
      <option value="amelia">Amelia</option>
      <option value="citrus">Citrus</option>
    </select>
    <div>
      <Crossword data="{dataOreo}" theme="{theme}" showCompleteMessage="{false}" />
    </div>
  </section>

  <section class:is-revealed="{revealedUSA}" class="usa">
		<p class="example">Example</p>
    <h1>Simple Customization</h1>
    <p>Custom class name on cells.</p>
    <Crossword data="{dataUSA}" bind:revealed="{revealedUSA}" />
  </section>

  <section>
    <p class="example">Example</p>
    <p>Advanced Customization</p>
    <Crossword data="{dataUSA}">
      <div
        class="toolbar"
        slot="toolbar"
        let:onReset
				let:onReveal
        style="background: yellow; padding: 2em;">
        <button on:click="{onReset}">reset</button>
        <button on:click="{onReveal}">reveal</button>
      </div>
      <img
        slot="complete"
        alt="celebration"
        src="https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif" />
    </Crossword>
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
	.example {
		display: inline-block;
		background: #ccc;
		padding: 0.5em;
		font-weight: bold;
		font-size: 0.85em;
		text-transform: uppercase;
	}
</style>
