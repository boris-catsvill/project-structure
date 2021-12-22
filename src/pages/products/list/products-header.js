const header = [
    {
      id: 'images',
      title: 'Image',
      sortable: false,
      template: data => {
        return `
            <div class="sortable-table__cell">
              ${data[0] ? `<img class="sortable-table-image" alt="Image" src="${data[0].url}">` : ''}
            </div>
          `;
      }
    },
    {
      id: 'title',
      title: 'Name',
      sortable: true,
      sortType: 'string',
      template: data => {
        return `
            <div class="sortable-table__cell">
              ${data}
            </div>
        `
      }
    },
    {
      id: 'subcategory',
      title: 'Category',
      sortable: false,
      template: data => {
        return `
            <div class="sortable-table__cell">
              ${data.category.title}
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
      id: 'status',
      title: 'Status',
      sortable: true,
      sortType: 'number',
      template: data => {
        return `<div class="sortable-table__cell">
            ${data > 0 ? 'Active' : 'Inactive'}
          </div>`;
      }
    },
  ];
  
  export default header;