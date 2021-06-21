const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const columns = [
  {
    id: 'id',
    title: 'ID'
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
    template: (createdAt = null) => (
      `<div class='sortable-table__cell'>
          <span>${ createdAt ? (new Date(createdAt)).toLocaleDateString() : '' }</span>
        </div>`
    )
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    template: (cost = 0) => (
      `<div class='sortable-table__cell'>
          <span>${ formatter.format(cost) }</span>
        </div>`
    )
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true
  }
];

export default columns;
