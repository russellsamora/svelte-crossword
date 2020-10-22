function fromPairs(arr) {
  let res = {};
  arr.forEach((d) => {
    res[d[0]] = d[1];
  });
  return res;
};

export { fromPairs };