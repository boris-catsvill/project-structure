const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => `<img class="sortable-table-image" alt="Image" src="${(data) ? data[0]?.url : ''}">`
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'quantity',
    title: 'Quantity',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: data => '$'+ data
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => `${data > 0 ? 'Active' : 'Inactive'}`
  },
];

export default header;
