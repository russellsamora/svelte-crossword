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
    <h1>NYT Mini</h1>
    <p>Default options.</p>
    <Crossword data="{dataNYT}" />
  </section>

  <section class="amelia">
    <h1>Oreo</h1>
    <p>Custom themes</p>
    <select bind:value="{theme}">
      <option value="classic">Classic</option>
      <option value="dark">Dark</option>
      <option value="amelia">Amelia</option>
      <option value="citrus">Citrus</option>
    </select>
    <div style="{theme == 'dark' ? 'background: black; color: white' : ''}">
      <Crossword data="{dataOreo}" theme="{theme}" />
    </div>
  </section>

  <section class:is-revealed="{revealedUSA}" class="usa">
    <h1>People in USA Today puzzles</h1>
    <p>Custom class name on cells.</p>
    <Crossword data="{dataUSA}" bind:revealed="{revealedUSA}" />
  </section>

  <section>
    <h1>People in USA Today puzzles</h1>
    <p>Custom completed content.</p>
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
</style>
