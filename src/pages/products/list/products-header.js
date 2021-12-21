const header = [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      if(data.length) {
        return `<div class="sortable-table__cell">
                  <img class="sortable-table-image" alt="Image" src="${data[0].url}">
                </div>`;
      }
      return ``;
    }
  },
  {
    id: 'title',
    title: 'Название',
    sortable: true,
  },
  {
    id: 'subcategory',
    title: 'Категория',
    sortable: true,
    template: data => {
      const { title, category } = data;

      if(title && category) {
        return (
          `<div class="sortable-table__cell">
          <span data-tooltip='
          <div class="sortable-table-tooltip">
          <span class="sortable-table-tooltip__category">${category.title}</span> /
          <b class="sortable-table-tooltip__subcategory">${title}</b>
          </div>'>${title}</span>
          </div>`
          );
      }

      return ''
    }
  },
  {
    id: 'quantity',
    title: 'Количество',
    sortable: true,
  },
  {
    id: 'price',
    title: 'Цена',
    sortable: true,
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    template: data => {
      return `
          <div class="sortable-table__cell">
            ${Boolean(data) ? 'активен' : 'не активен'}
          </div>
        `;
    }
  },
];

export default header;