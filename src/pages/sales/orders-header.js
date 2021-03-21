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
    customSorting: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    template: data => `
      <div class="sortable-table__cell">
        ${(new Date(data)).toLocaleDateString('ru-RU', { year: 'numeric', month: 'short', day: 'numeric' })}
      </div>
    `
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: data => `
      <div class="sortable-table__cell">
        $${data.toLocaleString('en-US')}
      </div>
    `
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
