<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let actions = ['reset', 'reveal'];
</script>

<div class="toolbar">
  {#each actions as action}
    {#if action == 'reset'}
      <button on:click="{() => dispatch('event', 'reset')}">Reset</button>
    {:else if action == 'reveal'}
      <button on:click="{() => dispatch('event', 'reveal')}">Reveal</button>
    {/if}
  {/each}
</div>

<style>
  .toolbar {
    margin-bottom: 2em;
  }
  button {
    cursor: pointer;
  }
</style>
