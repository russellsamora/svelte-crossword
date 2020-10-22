<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	export let hideReset;
	export let hideReveal;

</script>
<div class="toolbar">
  {#if !hideReset}
	<button on:click="{() => dispatch('event', 'reset')}">Reset</button>
	{/if}
  {#if !hideReveal}
	<button on:click="{() => dispatch('event', 'reveal')}">Reveal</button>
	{/if}
</div>

<style>
	.toolbar {
    margin-bottom: 2em;
  }
	button {
		cursor: pointer;
	}
</style>
