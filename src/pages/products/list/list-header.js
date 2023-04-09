const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            ${data.length ? '<img class="sortable-table-image" alt="Image" src="' + data[0].url + '">' : ''}
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Название',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Категория',
    template: data => {
      return `
        <div class="sortable-table__cell" data-tooltip="
        <div class='sortable-table-tooltip'>
          <span class='sortable-table-tooltip__category'>${data.category.title}</span> / <b class='sortable-table-tooltip__subcategory'>${data.title}</b>
        </div>">
          ${data.title}
        </div>
      `;
    }
  },
  {
    id: 'quantity',
    title: 'Кол-во',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Цена',
    sortable: true,
    sortType: 'number',
    template: data => `<div class="sortable-table__cell">$${data}</div>`
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    sortType: 'number',
    template: data => `<div class="sortable-table__cell">${data > 0 ? 'Active' : 'Inactive'}</div>`
  },
];

export default header;
