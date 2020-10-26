<script>
  import { fade } from 'svelte/transition';
  import Confetti from './Confetti.svelte';

  let isOpen = true;
</script>

{#if isOpen}
  <div class="curtain" transition:fade="{{ y: 20 }}">
    <div class="content">
			<div class="message">
				<slot name="message">
					<h3>You solved it!</h3>
				</slot>
			</div>
      <button on:click="{() => (isOpen = false)}"> View puzzle </button>
    </div>
    <div class="confetti">
      <Confetti />
    </div>
  </div>
  <div
    class="background"
    transition:fade="{{ duration: 250 }}"
    on:click="{() => (isOpen = false)}"></div>
{/if}

<style>
  .curtain {
    position: absolute;
    top: min(50%, 15em);
    left: 50%;
    background: white;
    transform: translate(-50%, -50%);
    border-radius: 4px;
    z-index: 10;
    box-shadow: 0 4px 8px 4px rgba(0, 0, 0, 0.2);
  }

  .background {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: #fff;
    opacity: 0.9;
    cursor: pointer;
    z-index: 2;
  }

  h3 {
    margin: 0;
    margin-bottom: 0.5em;
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
  
	.content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2em;
    z-index: 10;
  }

	.message {
		margin-bottom: 1em;
	}

  .confetti {
    position: absolute;
    top: 30%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
