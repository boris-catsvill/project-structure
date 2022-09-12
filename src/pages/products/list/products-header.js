const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: (data = []) => {
      return `
        <div class="sortable-table__cell">
          <img class="sortable-table-image" alt="Image" src="${data[0]?.url}">
        </div>
      `;
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
    sortType: 'string',
    template: ({ title, category }) => {
      return `<div class="sortable-table__cell">
      <span data-tooltip="
      <div class='sortable-table-tooltip'>
        <span class='sortable-table-tooltip__category'>${category.title}</span> /
        <b class='sortable-table-tooltip__subcategory'>${title}</b>
      </div>">${title}</span>
    </div>`;
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
    template: price => {
      return `<div class="sortable-table__cell">
      $${price}
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
