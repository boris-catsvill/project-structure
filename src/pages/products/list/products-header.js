import escapeHtml from '../../../utils/escape-html.js';

const getSubcategoryTooltip = (category, subcategory) => `
  <div class="sortable-table-tooltip">
    <span class="sortable-table-tooltip__category">${category}</span> / <b class="sortable-table-tooltip__subcategory">${subcategory}</b>
  </div>
`;

const header = [
  {
    id: 'images',
    title: 'Фото',
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
    title: 'Название',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Категория',
    sortable: false,
    template: data => {
      return `
        <div class="sortable-table__cell">
          <span data-tooltip="${escapeHtml(getSubcategoryTooltip(data.category.title, data.title))}">${data.title}</span>
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
    sortType: 'number',
    template: data => `
      <div class="sortable-table__cell">
        $${data.toLocaleString('en-US')}
      </div>
    `
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
        ${data > 0 ? 'Активен' : 'Неактивен'}
      </div>`;
    }
  },
];

export default header;
