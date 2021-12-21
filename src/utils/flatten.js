const flatten = (array) => array.reduce((acc, it) => {
  return acc.concat(Array.isArray(it) ? flatten(it) : it);
}, []);

export default flatten;