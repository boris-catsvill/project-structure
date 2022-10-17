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
    template: date => {
      return `<div class="sortable-table__cell">${(new Date(date).toLocaleString('ru', {day: 'numeric', month: 'long', year: '2-digit'}))}</div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: value => {
      return `<div class="sortable-table__cell">${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value)}</div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string',
  },
];

export default header;