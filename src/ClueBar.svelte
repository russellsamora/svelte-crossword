<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let currentClue = {};
  $: clue = currentClue["clue"];
  $: custom = currentClue["custom"] || "";
</script>

<div class="bar {custom}">
  <button on:click="{() => dispatch('nextClue', currentClue.index - 1)}">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-chevron-left">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  </button>
  <p>{clue}</p>
  <button on:click="{() => dispatch('nextClue', currentClue.index + 1)}">
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="feather feather-chevron-right">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  </button>
</div>

<style>
  .bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    background-color: var(--secondary-highlight-color);
    align-items: center;
  }

  p {
    padding: 0 1em;
    line-height: 1.325;
    font-family: var(--font);
  }

  button {
    cursor: pointer;
    font-size: 1em;
    border: none;
    line-height: 1;
    color: var(--main-color);
    background-color: transparent;
  }
</style>
