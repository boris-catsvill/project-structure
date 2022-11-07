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
    template: (data = []) => {
      return `
        <div class="sortable-table__cell">
          ${(new Date(data)).toString().slice(3, 7)} ${new Date(data).getDate()}, ${new Date(data).getFullYear()}
        </div>
       `;
      }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: (data = []) => {
      return `
        <div class="sortable-table__cell">
          $${new Intl.NumberFormat('en-EN').format(data)}
        </div>
    `;
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