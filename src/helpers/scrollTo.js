export default function scrollTO (node, isFocused) {
  return {
    update(newIsFocused) {
      isFocused = newIsFocused;
      if (!isFocused) return;
      const list = node.parentElement.parentElement;
      if (!list) return;

      const top = node.offsetTop;
      const currentYTop = list.scrollTop;
      const currentYBottom = currentYTop + list.clientHeight;
      const buffer = 50;
      if (top < currentYTop + buffer || top > currentYBottom - buffer) {
        list.scrollTo({ top: top, behavior: "smooth" });
      }
    },
  };
}
