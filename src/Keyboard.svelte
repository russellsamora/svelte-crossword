<script>
	import { createEventDispatcher } from 'svelte';
	import keyboardData from './helpers/keyboard-data.js';
  const dispatch = createEventDispatcher();
	
	const unique = arr => [...new Set(arr)];
	const rows = unique(keyboardData.map(d => d.row));
	rows.sort((a,b) => a - b);

	$: rowData = rows.map(r => keyboardData.filter(k => k.row === r));

	function onKey() {
		const value = this.innerText;
		dispatch('keydown', value);
	}

</script>

<div class="keyboard">
	{#each rowData as keys}
		<div class="row">
		{#each keys as { value }}
			<button on:touchstart="{onKey}" on:click="{onKey}">{value}</button>
		{/each}
		</div>
	{/each}
</div>

<style>
	.row {
		display: flex;
		justify-content: center;
		
	}
	
	button {
		font-size: 1em;
		width: 2em;
		text-align: center;
		padding: 0.5em 0.25em;
		margin: 0.1em;
		border-radius: 2px;
		background-color: #efefef;
		border: none;
		outline: none;
		cursor: pointer;
	}
	
	button:active {
		transform: scale(2);
		background-color: #cdcdcd;
	}
</style>