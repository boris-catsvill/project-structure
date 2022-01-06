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
      const day = new Intl.DateTimeFormat('ru', {day: '2-digit'}).format(new Date(data));
      const month = new Intl.DateTimeFormat('ru', {month: 'short'}).format(new Date(data));
      const year = new Intl.DateTimeFormat('ru', {year: 'numeric'}).format(new Date(data));
      return `<div class="sortable-table__cell">
          ${day} ${month} ${year} г.
        </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          $${data.toLocaleString('en-US')}
        </div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
