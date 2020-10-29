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
    font-family: var(--toolbar-text-font);
    font-size: var(--toolbar-text-size);
    background-color: var(--toolbar-bg);
  }
  button {
    cursor: pointer;
    margin-left: 1em;
    font-size: 1em;
    background-color: var(--toolbar-button-bg);
    border-radius: var(--toolbar-button-border-radius);
    color: var(--toolbar-button-color);
    padding: var(--toolbar-button-padding);
    border: var(--toolbar-button-border);
    font-weight: var(--toolbar-button-text-weight);
    transition: background-color 150ms;
  }
  button:hover {
    background-color: var(--toolbar-button-bg-hover);
  }
</style>
