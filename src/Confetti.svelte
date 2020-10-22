<script>
  import { quadIn } from "svelte/easing";

  export let numberOfElements = 50;
  export let durationInSeconds = 2;
  export let colors = [
    "#fff",
    "#c7ecee",
    "#778beb",
    "#f7d794",
    "#63cdda",
    "#cf6a87",
    "#e77f67",
    "#786fa6",
    "#FDA7DF",
    "#4b7bec",
    "#475c83",
  ];

  const pickFrom = (arr) => arr[Math.round(Math.random() * arr.length)];
  const randomNumber = (min, max) => Math.random() * (max - min) + min;
  const getManyOf = (str) => new Array(30).fill(0).map(() => str);

  const elementOptions = [
    ...getManyOf(`<circle r="3" />`),
    ...getManyOf(
      `<path d="M3.83733 4.73234C4.38961 4.73234 4.83733 4.28463 4.83733 3.73234C4.83733 3.18006 4.38961 2.73234 3.83733 2.73234C3.28505 2.73234 2.83733 3.18006 2.83733 3.73234C2.83733 4.28463 3.28505 4.73234 3.83733 4.73234ZM3.83733 6.73234C5.49418 6.73234 6.83733 5.38919 6.83733 3.73234C6.83733 2.07549 5.49418 0.732341 3.83733 0.732341C2.18048 0.732341 0.83733 2.07549 0.83733 3.73234C0.83733 5.38919 2.18048 6.73234 3.83733 6.73234Z" />`
    ),
    ...getManyOf(
      `<path d="M4.29742 2.26041C3.86864 2.1688 3.20695 2.21855 2.13614 3.0038C1.69078 3.33041 1.06498 3.23413 0.738375 2.78876C0.411774 2.3434 0.508051 1.7176 0.953417 1.39099C2.32237 0.387097 3.55827 0.0573281 4.71534 0.304565C5.80081 0.536504 6.61625 1.24716 7.20541 1.78276C7.28295 1.85326 7.35618 1.92051 7.4263 1.9849C7.64841 2.18888 7.83929 2.36418 8.03729 2.52315C8.29108 2.72692 8.48631 2.8439 8.64952 2.90181C8.7915 2.95219 8.91895 2.96216 9.07414 2.92095C9.24752 2.8749 9.5134 2.7484 9.88467 2.42214C10.2995 2.05757 10.9314 2.09833 11.2959 2.51319C11.6605 2.92805 11.6198 3.5599 11.2049 3.92447C10.6816 4.38435 10.1478 4.70514 9.58752 4.85394C9.00909 5.00756 8.469 4.95993 7.9807 4.78667C7.51364 4.62093 7.11587 4.34823 6.78514 4.08268C6.53001 3.87783 6.27248 3.64113 6.04114 3.4285C5.97868 3.37109 5.91814 3.31544 5.86006 3.26264C5.25645 2.7139 4.79779 2.36733 4.29742 2.26041Z" />`
    ),
    ...getManyOf(`<rect width="4" height="4" x="-2" y="-2" />`),
    `<path d="M -5 5 L 0 -5 L 5 5 Z" />`,
    ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      .split("")
      .map((letter) => `<text style="font-weight: 700">${letter}</text>`),
  ];

  const allElements = new Array(numberOfElements)
    .fill(0)
    .map((_, i) => [pickFrom(elementOptions), pickFrom(colors), Math.random()]);
</script>

<svg class="confetti" viewBox="-10 -10 10 10">
  {#each allElements as [element, color, scale], i}
    <g style="transform: scale({scale})">
      <g
        fill="{color}"
        style="{[`--rotation: ${Math.random() * 360}deg`, `animation-delay: ${quadIn(i / numberOfElements)}s`, `animation-duration: ${durationInSeconds * randomNumber(0.7, 1)}s`].join(';')}">
        {@html element}
      </g>
    </g>
  {/each}
</svg>

<style>
  .confetti {
    width: 2em;
    position: absolute;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill-rule: evenodd;
    clip-rule: evenodd;
    pointer-events: none;
    overflow: visible;
    transform: translate(-50%, -50%);
  }
  @keyframes pop {
    0% {
      transform: rotate(var(--rotation)) scale(1) translate(0em, 0em);
    }
    100% {
      transform: rotate(calc(var(--rotation) + 60deg)) scale(0)
        translate(9em, 9em);
      fill: white;
    }
  }
  g {
    transition: all 0.5s ease-out;
    transform: rotate(var(--rotation)) scale(0) translate(0, 0);
    animation: pop 2s ease-out;
    animation-iteration-count: infinite;
  }
</style>
