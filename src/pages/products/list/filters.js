const filters = [
  {
    id: 'title',
    filterFns: (item, title) => item['title'] && item['title'].includes(title),
    testFns: title => title
  },
  {
    id: 'status',
    filterFns: (item, status) => item['status'] === status,
    testFns: status => typeof status === 'number'
  },
  {
    id: 'price',
    filterFns: (item, price) => item['price'] >= price.from && item['price'] <= price.to,
    testFns: price => price && typeof price.from === 'number' && typeof price.to === 'number'
  }
];

export default filters;
