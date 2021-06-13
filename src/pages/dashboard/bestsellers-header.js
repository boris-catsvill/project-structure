const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
            ${data[0] && 'url' in data[0] ? `<img class="sortable-table-image" alt="Image" src="${data[0].url}">` : ''}
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
    template: data => `
      <div class="sortable-table__cell">
        <span data-tooltip="
        <div class=&quot;sortable-table-tooltip&quot;>
          <span class=&quot;sortable-table-tooltip__category&quot;>${data.category.title}</span> /
          <b class=&quot;sortable-table-tooltip__subcategory&quot;>${data.title}</b>
        </div>">${data.title}</span>
      </div>`
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
    template: data => `<div class="sortable-table__cell">$${data}</div>`
  },
  {
    id: 'sales',
    title: 'Продажи',
    sortable: true,
    sortType: 'number'
  },
];

export default header;
