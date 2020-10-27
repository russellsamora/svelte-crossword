<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let actions = ["clear", "reveal"];
</script>

<div class="toolbar">
  {#each actions as action}
    {#if action == 'clear'}
      <button on:click="{() => dispatch('event', 'clear')}">Clear</button>
    {:else if action == 'reveal'}
      <button on:click="{() => dispatch('event', 'reveal')}">Reveal</button>
    {/if}
  {/each}
</div>

<style>
  .toolbar {
    margin-bottom: 1em;
    padding: 1em 0;
    display: flex;
    justify-content: flex-end;
    font-family: var(--toolbar-font, -apple-system, Helvetica, sans-serif);
    font-size: var(--toolbar-font-size, 0.85em);
    background-color: var(--toolbar-bg, transparent);
  }
  button {
    cursor: pointer;
    margin-left: 1em;
    font-size: 1em;
    background-color: var(--toolbar-button-bg, #efefef);
    border-radius: var(--toolbar-button-border-radius, 4px);
    color: var(--toolbar-button-color, #6a6a6a);
    padding: var(--toolbar-button-padding, 0.75em);
    border: var(--toolbar-button-border, none);
    font-weight: var(--toolbar-button-font-weight, 400);
    transition: background-color 150ms;
  }
  button:hover {
    background-color: var(--toolbar-button-bg-hover, #cdcdcd);
  }
</style>
