const getSubElements = (parentElement, dataAttribute) => {
  const elements = parentElement.querySelectorAll(`[data-${dataAttribute}]`);

  return [...elements].reduce((accum, subElement) => {
    accum[subElement.dataset[dataAttribute]] = subElement;

    return accum;
  }, {});
}

export default getSubElements;
