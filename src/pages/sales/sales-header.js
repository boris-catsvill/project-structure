const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Client',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'string',
    template: date => `<div class="sortable-table__cell">${date.split('T')[0].replaceAll('-', '.').split('.').reverse().join('.')}</div>`
  },
  {
    id: 'totalCost',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: price => `<div class="sortable-table__cell">${price}$</div>`
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'number',
  }
];

export default header;
