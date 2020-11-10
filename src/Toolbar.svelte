<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  export let actions = ["clear", "reveal", "check"];
</script>

<div class="toolbar">
  {#each actions as action}
    {#if action === 'clear'}
      <button on:click="{() => dispatch('event', 'clear')}">Clear</button>
    {:else if action === 'reveal'}
      <button on:click="{() => dispatch('event', 'reveal')}">Reveal</button>
    {:else if action === 'check'}
      <button on:click="{() => dispatch('event', 'check')}">Check</button>
    {/if}
  {/each}
</div>

<style>
  .toolbar {
    margin-bottom: 1em;
    padding: 1em 0;
    display: flex;
    justify-content: flex-end;
    font-family: var(--font);
    font-size: 0.85em;
    background-color: transparent;
  }

  button {
    cursor: pointer;
    margin-left: 1em;
    font-size: 1em;
    font-family: var(--font);
    background-color: var(--accent-color);
    border-radius: 4px;
    color: var(--main-color);
    padding: 0.75em;
    border: none;
    font-weight: 400;
    transition: background-color 150ms;
  }

  button:hover {
    background-color: var(--secondary-highlight-color);
  }
</style>
