import escapeHtml from '@/utils/escape-html.js';

const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      const image = data[0]
        ? `<img class="sortable-table-image" alt="Image" src="${data[0].url}">`
        : '';

      return `<div class="sortable-table__cell">${image}</div>`;
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
      const tooltip = `
        <div class="sortable-table-tooltip">
          <span class="sortable-table-tooltip__category">${data.category.title}</span> /
          <b class="sortable-table-tooltip__subcategory">${data.title}</b>
        </div>
      `;

      return `
          <div class="sortable-table__cell">
            <span data-tooltip="${escapeHtml(tooltip)}">${data.title}</span>
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
    sortType: 'number',
    template: data => {
      return `
        <div class="sortable-table__cell">
          $${parseFloat(data).toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </div>`;
    }
  },
  {
    id: 'status',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `
        <div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  },
];

export default header;
