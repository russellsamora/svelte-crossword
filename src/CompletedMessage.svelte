<script>
  import { fade } from "svelte/transition";
  import Confetti from "./Confetti.svelte";

  export let showConfetti = true;

  let isOpen = true;
</script>

{#if isOpen}
  <div class="completed" transition:fade="{{ y: 20 }}">
    <div class="content">
      <div class="message">
        <slot />
      </div>

      <button on:click="{() => (isOpen = false)}">View puzzle</button>
    </div>

    {#if showConfetti}
      <div class="confetti">
        <Confetti />
      </div>
    {/if}
  </div>
  <div
    class="curtain"
    transition:fade="{{ duration: 250 }}"
    on:click="{() => (isOpen = false)}"></div>
{/if}

<style>
  .completed {
    position: absolute;
    top: min(50%, 15em);
    left: 50%;
    background-color: var(--bg-color);
    transform: translate(-50%, -50%);
    border-radius: 4px;
    z-index: 100;
    box-shadow: 0 4px 8px 4px rgba(0, 0, 0, 0.2);
    font-family: var(--font);
  }

  .curtain {
    position: absolute;
    top: 0;
    right: -2px;
    bottom: 0;
    left: 0;
    background-color: var(--bg-color);
    opacity: 0.9;
    cursor: pointer;
    z-index: 1;
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

  .content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2em;
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
