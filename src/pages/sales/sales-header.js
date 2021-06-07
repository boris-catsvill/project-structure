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
    sortType: 'string',
    template: data => {
      const date = new Date(data);
      const months = {
        0: 'янв.', 1: 'фев.', 2: 'март',
        3: 'апр.', 4: 'май', 5: 'июнь.',
        6: 'июль.', 7: 'авг.', 8: 'сен.',
        9: 'окт.', 10: 'ноя.', 11: 'дек.',
      };
      return `<div class="sortable-table__cell">${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} г.</div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: date => {
      return `<div class="sortable-table__cell">$${date}</div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data > 0 ? 'Доставлено' : 'В пути'}
        </div>`;
    }
  },
];

export default header;
