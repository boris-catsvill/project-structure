const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            <img class="sortable-table-image" alt="Image" src="${data[0] ? data[0].url : '../not-found.svg'}">
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
    sortable: false,
    sortType: 'string',
    template: ({ title, category }) => {
      const tooltipMessage = `
        <div class='sortable-table-tooltip'>
          <span class='sortable-table-tooltip__category'>${title}</span> / <b class='sortable-table-tooltip__subcategory'>${category.title}</b>
        </div>
      `;

      return `
          <div class="sortable-table__cell">
            <span data-tooltip="${tooltipMessage}">
              ${category.title}
            </span>
          </div>
        `;
    }
  },
  {
    id: 'quantity',
    title: 'Количество',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Цена',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    sortType: 'string',
    template: status => {
      const value = status === 0 ? 'Неактивен' : 'Активен';

      return `<div class="sortable-table__cell">${value}</div>`;
    }
  },
];

export default header;
