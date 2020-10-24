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
		{#each keys as { value }}
			<button on:touchstart="{onKey}" on:click="{onKey}">{value}</button>
		{/each}
	{/each}
</div>

