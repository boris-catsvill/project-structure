export const getSubElements = item => {
  const elements = item.querySelectorAll('[data-element]');
  return [...elements].reduce((accum, val) => {
    accum[val.dataset.element] = val;
    return accum;
  }, {});
};
