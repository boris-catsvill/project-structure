const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0] ? data[0].url : ''}">
          </div>`;
    }
  },
  {
    id: 'title',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Category',
    sortable: false,
    template: data => {
      return `<div class="sortable-table__cell">${data.title}</div>`;
    }
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
    template: data => {
      return `<div class="sortable-table__cell">$${data}</div>`;
    }
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'string',
    template: data => {
      return `<div class="sortable-table__cell">${data === 1 ? 'Active' : 'Not active'}</div>`;
    }
  },
];

export default header;
