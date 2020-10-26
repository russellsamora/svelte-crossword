<script>
	export let currentClue;
</script>


<div class="bar">
	<button>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-left"><polyline points="15 18 9 12 15 6"></polyline></svg>
	</button>
	<p>{currentClue.clue}</p>
	<button>
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevron-right"><polyline points="9 18 15 12 9 6"></polyline></svg>
	</button>
</div>

<style>
	.bar {
		display: flex;
		justify-content: space-between;
		background-color: #efefef;
	}

	p {
		padding: 0 1em;
		line-height: 1.325;
	}
	
	button {
    cursor: pointer;
		font-size: 1em;
		border: none;
		line-height: 1;
  }
</style>

