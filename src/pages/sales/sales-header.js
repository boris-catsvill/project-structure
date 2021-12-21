const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'string'
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
    sortType: 'string',
    template: data => `<div class="sortable-table__cell">${new Date(Date.parse(data))
        .toLocaleDateString('ru', { year: 'numeric', month: 'short', day: 'numeric' })}</div>`
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'string',
    template: data => `<div class="sortable-table__cell">${'$' + data}</div>`
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string',
  },
];

export default header;
