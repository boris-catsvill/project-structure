const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0].url}">
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
    title: 'Categoty',
    sortable: false,
    template: data => {
      return `
        <div class="sortable-table__cell">
          <span data-tooltip="
            <div class='sortable-table-tooltip'>
              <span class='sortable-table-tooltip__category'>${data.category.title}</span>
                 / 
              <b class='sortable-table-tooltip__subcategory'>
                ${data.title}
              </b>
            </div>
          ">${data.title}</span>
        </div>
      `;
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
    sortType: 'number'
  },
  {
    id: 'sales',
    title: 'Sales',
    sortable: true,
    sortType: 'number'
  },
];

export default header;
