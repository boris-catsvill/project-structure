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
      const date = new Date(data.split('T')[0]);
      return `
      <div class="sortable-table__cell">
      ${date.toLocaleString('default', { dateStyle: 'medium' })}
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
    sortType: 'number'
  }
];

export default header;
