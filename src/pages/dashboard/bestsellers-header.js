const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
          <div class="sortable-table__cell">
          ${(data[0] && data[0].url) ? `<img class="sortable-table-image" alt="Image" 
            src=${data[0].url} >` : ''}
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
      <span data-tooltip='
           <div class="sortable-table-tooltip">
          <span class="sortable-table-tooltip__category">${data.category.title}</span> /
          <b class="sortable-table-tooltip__subcategory">${data.title}</b>
        </div>'>${data.title}</span> 
      </div>`;
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
    id: 'sales',
    title: 'Продажи',
    sortable: true,
    sortType: 'number',

  },
];

export default header;
