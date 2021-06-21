const columns = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `
          <div class='sortable-table__cell'>
            <img class='sortable-table-image' alt='Image' src='${ data[0].url }'>
          </div>
        `;
    }
  },
  {
    id: 'title',
    title: 'Наименование',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'subcategory',
    title: 'Категория',
    sortable: false,
    template: ({ title = '' } = {}) => (
      `<div class='sortable-table__cell'>
          <span>${ title }</span>
        </div>`
    )
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
    title: 'Статус'
  }
];

export default columns;
