const header = [
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
      const date = new Date(data);
      return `<div class="sortable-table__cell">
          ${date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Active' : 'Inactive'}
        </div>`;
    }
  },
];

export default header;
