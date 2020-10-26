<script>
	import { createEventDispatcher } from 'svelte';
	import keyboardData from './helpers/keyboard-data.js';
  const dispatch = createEventDispatcher();
	
	const unique = arr => [...new Set(arr)];
	const rows = unique(keyboardData.map(d => d.row));
	rows.sort((a,b) => a - b);

	const swaps = {
		"delete": '<svg width="5vw" height="5vw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-delete"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>'
	};

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
			<button
				class:single={value.length === 1}
				on:touchstart="{() => dispatch("keydown", value)}"
				on:click="{() => dispatch("keydown", value)}">
				{#if swaps[value]}
				 {@html swaps[value]}
				{:else}
					{value}
				{/if}
			</button>
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
		font-size: 5vw;
		text-align: center;
		width: auto;
		padding: 0.5em;
		margin: 0.1em;
		border-radius: 2px;
		background-color: #efefef;
		border: none;
		outline: none;
		cursor: pointer;
		line-height: 1;
		vertical-align: baseline;
	}

	button:active {
		transform: scale(2);
		background-color: #cdcdcd;
	}

	button.single {
		width: 8vw;
		padding: 0.5em 0;
	}
</style>