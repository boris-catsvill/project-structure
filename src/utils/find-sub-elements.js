export const findSubElements = (element) => {
  const subElements = {};
  element.querySelectorAll('*[data-element]').forEach(elem => {
    subElements[elem.dataset.element] = elem;
  });
  return subElements;
};

