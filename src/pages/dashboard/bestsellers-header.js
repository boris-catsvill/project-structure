import escapeHtml from '../../utils/escape-html.js';

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
    sortable: true,
    sortType: 'custom',
    template: data => {
      return `
        <div class="sortable-table__cell">
          <span data-tooltip="${escapeHtml(getSubcategoryTooltip(data.category.title, data.title))}">${data.title}</span>
        </div>
      `;
    },
    customSorting: (a, b) => a.subcategory.title.localeCompare(b.subcategory.title, ['ru', 'en'], { caseFirst: 'upper' }),
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
    template: data => {
      return `
        <div class="sortable-table__cell">
          <span>$${data}</span>
        </div>
      `;
    },
  },
  {
    id: 'sales',
    title: 'Продажи',
    sortable: true,
    sortType: 'number'
  },
];

export default header;
