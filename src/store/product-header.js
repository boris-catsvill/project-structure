const header = [
  {
    id: 'images',
    title: 'Image',
    sortable: false,
    template: data => {
      if (!data[0]?.url) {return `<div class="sortable-table__cell"></div>`;}
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
      return `<div class="sortable-table__cell">
          ${data && (data > 0) ? 'Active' : 'Inactive'}
        </div>`;
    }
  },
];

export default header;
