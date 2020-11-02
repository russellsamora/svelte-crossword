<script>
  import Crossword from "../src/Crossword.svelte";
  import dataNYTMini from "./data/nyt-mini.json";
  import dataNYTDaily from "./data/nyt-daily.json";
  import dataOreo from "./data/oreo.json";
  import dataAmelia from "./data/amelia.json";
  import dataUSA from "./data/usa.json";

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
    <div class="info">
      <h2>Default</h2>
      <p>
        A
        <a href="https://www.nytimes.com/crosswords/game/daily/2020/10/21">NYT
          daily</a>
        puzzle with all default settings.
      </p>
    </div>
    <Crossword data="{dataNYTDaily}" />
  </section>

  <section id="mini" style="max-width: 480px;">
    <div class="info">
      <h2>Mobile</h2>
      <p>
        A
        <a href="https://www.nytimes.com/crosswords/game/mini/2020/10/21">NYT
          mini</a>
        puzzle with all default settings and forced mobile view.
      </p>
    </div>
    <Crossword data="{dataNYTMini}" showKeyboard="{true}" />
  </section>

  <section
    id="themes"
    style="background: {theme === 'dark' ? '#1a1a1a' : 'transparent'}">
    <div class="info">
      <h2>Themes</h2>
      <p>A library of preset style themes to choose from.</p>
      <select bind:value="{theme}">
        <option value="classic">Classic</option>
        <option value="dark">Dark</option>
        <!-- <option value="amelia">Amelia</option> -->
        <option value="citrus">Citrus</option>
      </select>
    </div>
    <div>
      <Crossword
        data="{dataOreo}"
        theme="{theme}"
        showCompleteMessage="{false}" />
    </div>
  </section>

  <section id="simple-customization" class:is-revealed="{revealedUSA}">
    <div class="info">
      <h2>Simple Customization</h2>
      <p>Custom class name on clues and cells.</p>
    </div>
    <Crossword
      data="{dataUSA}"
      disableHighlight="{revealedUSA}"
      bind:revealed="{revealedUSA}" />
  </section>

  <section id="advanced-customization">
    <div class="info">
      <h2>Advanced Customization</h2>
      <p>TBD.</p>
    </div>
    <Crossword data="{dataNYTDaily}">
      <div
        class="toolbar"
        slot="toolbar"
        let:onClear
        let:onReveal
        style="background: yellow; padding: 2em;">
        <button on:click="{onClear}">clear puzzle</button>
        <button on:click="{onReveal}">show answers</button>
      </div>
      <div slot="complete">
        <h3>OMG, congrats!</h3>
        <img
          alt="celebration"
          src="https://media3.giphy.com/media/QpOZPQQ2wbjOM/giphy.gif" />
      </div>
    </Crossword>
  </section>
</article>

<style>
  .intro {
    text-align: center;
    max-width: 640px;
    margin: 0 auto;
  }
  section {
    max-width: 960px;
    margin: 5em auto;
    padding: 0 1em;
  }

  .info {
    max-width: 640px;
    margin: 1em auto;
    text-align: center;
  }
  h1 {
    font-size: 2em;
    text-align: center;
  }
  h2 {
    font-size: 1.625em;
    text-align: center;
  }
  p {
    margin: 1em auto;
    text-align: center;
  }
</style>
