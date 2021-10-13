const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
          <div class='sortable-table__cell'>
            <img class='sortable-table-image' alt='Image' src='${data[0].url}'>
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
    sortType: 'number',
    template: data => {
      return `<div class='sortable-table__cell'>
          ${data ? data.title : ''}
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
    sortType: 'number',
    template: data => {
      return `<div class='sortable-table__cell'>
          &#36;${data}
        </div>`;
    }
  },
  {
    id: 'sales',
    title: 'Продажи',
    sortable: true,
    sortType: 'number'
  }
];

export default header;
