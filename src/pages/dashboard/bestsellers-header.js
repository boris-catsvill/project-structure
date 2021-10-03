import escapeHtml from '../../utils/escape-html.js';

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
          <span data-tooltip="${escapeHtml(getTooltip(data))}">${data.title}</span>
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
    template: data => {
      return `
        <div class="sortable-table__cell">
          $${data.toLocaleString()}
        </div>
      `;
    }
  },
  {
    id: 'sales',
    title: 'Продажи',
    sortable: true,
    sortType: 'number'
  }
];

function getTooltip(data) {
  return `
    <div class="sortable-table-tooltip">
      <span class="sortable-table-tooltip__category">${data.category.title}</span> /
      <b class="sortable-table-tooltip__subcategory">${data.title}</b>
    </div>
  `;
}

export default header;
