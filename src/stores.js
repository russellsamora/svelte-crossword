import { derived, writable } from "svelte/store";
import createCells from "./helpers/createCells.js";

export const clues = writable([]);
export const cells = writable([]);
export const focusedCellIndex = writable(0);
export const focusedCell = derived(
  [focusedCellIndex, cells],
  ([focusedCellIndex, cells]) => {
    return cells[focusedCellIndex] || {};
  }
);

clues.subscribe((clues) => {
  cells.set(createCells(clues));
});

export const onCellUpdate = (index, newValue) => {
  console.log("onCellUpdate");
  cells.update((cells) => [
    ...cells.slice(0, index),
    { ...cells[index], value: newValue },
    ...cells.slice(index + 1),
  ]);

  // // TODO why? seems hacky
  // it for some reason iterates through all cells
  // was a quick fix but needs more digging
  setTimeout(() => {
    onFocusNextCell();
  });
};

export const onFocusCell = (index) => {
  focusedCellIndex.set(index);
};

export const onFocusNextCell = () => {
  focusedCellIndex.update((value) => value + 1);
};
