<script>
  import Crossword from "../src/Crossword.svelte";
  import dataNYTMini from "./data-nyt-mini.json";
  import dataNYTDaily from "./data-nyt-daily.json";
  import dataOreo from "./data-oreo.json";
  import dataAmelia from "./data-amelia.json";
  import dataUSA from "./data-usa.json";

  let revealedUSA;
  let theme;
</script>

<article>
  <div class="intro">
    <h1>Svelte Crossword</h1>
    <p>
      A crossword component for
      <a href="https://svelte.dev">Svelte</a>. Read the docs on
      <a
        href="https://github.com/russellgoldenberg/svelte-crossword#svelte-crossword">Github</a>.
    </p>
  </div>

  <section id="default">
    <p class="example">Example</p>
    <h1>Default</h1>
    <p>
      An
      <a href="https://www.nytimes.com/crosswords/game/mini/2020/10/21">NYT mini</a>
      puzzle with all default settings.
    </p>
    <Crossword data="{dataNYTMini}" />
  </section>

  <section id="default2">
    <p class="example">Example</p>
    <h1>Default</h1>
    <p>
      An
      <a href="https://www.nytimes.com/crosswords/game/daily/2020/10/21">NYT
        daily</a>
      puzzle with all default settings.
    </p>
    <Crossword data="{dataNYTDaily}" />
  </section>

  <section id="themes">
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
      <Crossword
        data="{dataOreo}"
        theme="{theme}"
        showCompleteMessage="{false}" />
    </div>
  </section>

  <section id="simple-customization" class:is-revealed="{revealedUSA}">
    <p class="example">Example</p>
    <h1>Simple Customization</h1>
    <p>Custom class name on cells.</p>
    <Crossword
      data="{dataUSA}"
      disableHighlight="{revealedUSA}"
      bind:revealed="{revealedUSA}" />
  </section>

  <section id="advanced-customization">
    <p class="example">Example</p>
    <p>Advanced Customization</p>
    <Crossword data="{dataNYTDaily}">
      <div
        class="toolbar"
        slot="toolbar"
        let:onReset
        let:onReveal
        style="background: yellow; padding: 2em;">
        <button on:click="{onReset}">reset</button>
        <button on:click="{onReveal}">reveal</button>
      </div>
      <div slot="complete">
				<h3>OMG, congrats!</h3>
				<img alt="celebration" src="https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif" />
			</div>
    </Crossword>
  </section>
</article>

<style>
  article {
    font-family: sans-serif;
  }
  .intro {
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
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
