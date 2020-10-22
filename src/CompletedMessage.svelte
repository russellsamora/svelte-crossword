<script>
  import { fade, fly } from "svelte/transition";
  import Confetti from "./Confetti.svelte";

  let isOpen = true;
</script>

{#if isOpen}
  <div class="c" transition:fly="{{ y: 20 }}">
    <h3>You did it!</h3>
    <Confetti />
    <button on:click="{() => (isOpen = false)}"> View puzzle </button>
  </div>
  <div
    class="background"
    transition:fade="{{ duration: 300 }}"
    on:click="{() => (isOpen = false)}"></div>
{/if}

<style>
  .c {
    position: absolute;
    top: 50%;
    left: 50%;
    padding: 2em;
    background: white;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: 2em;
    z-index: 10;
    box-shadow: 0 13px 27px -5px rgba(50, 50, 93, 0.25),
      0 8px 16px -8px rgba(0, 0, 0, 0.3);
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
    margin-bottom: 1em;
  }

  button {
    appearance: none;
    background: white;
    font-weight: 700;
    border-radius: 2em;
    line-height: 1.3em;
    /* color: white; */
    padding: 0.9em 1.3em;
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border: 2px solid black;
    outline: none;
    cursor: pointer;
  }
  button:hover,
  button:focus {
    background: black;
    color: white;
  }
</style>
