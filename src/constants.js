export const salesTableHeader = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Дата',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `
        <div class="sortable-table__cell">
            ${new Date(data).toLocaleString('default', { dateStyle: 'medium' })}
        </div>
      `;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: data => `<div class="sortable-table__cell">$${data}</div>`
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  }
];

export const productsTableHeader = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
        <div class="sortable-table__cell">
          ${data.length ? `<img class="sortable-table-image" alt="Image" src="${data[0].url}">` : ""}
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
    template: subcategory => {
      return `
        <div class="sortable-table__cell">
          ${subcategory.title}
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
    sortType: 'number',
    template: data => {
      return `
        <div class="sortable-table__cell">
            ${data ? "Активен" : "Неактивен"}
        </div>
      `;
    }
  },
];
