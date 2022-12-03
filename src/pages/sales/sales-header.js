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
    sortType: 'custom',
    sort: (a, b) => new Date(a) - new Date(b),
    template: data => {
      return `
        <div class="sortable-table__cell">
          ${new Date(data).toLocaleString('default', {dateStyle: 'medium'})}
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
    sortType: 'string',
  },
];

export default header;
