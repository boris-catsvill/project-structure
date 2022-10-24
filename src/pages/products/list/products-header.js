const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `<div class="sortable-table__cell">
          <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
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
    sortable: true,
    sortType: 'custom',
    template: data => {
      return `<div 
          class="sortable-table__cell" 
          data-tooltip="${`${data.category?.title} / <b>${data.title}</b>`}"
        >${data.title}</div>`;
    },
    customSorting: (prevItem, nextItem) => {
      return nextItem.title.localeCompare(prevItem.title, 'ru');
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
      return `<div class="sortable-table__cell">
          $${data}
        </div>`;
    }
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  }
];

export default header;