const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number',
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
      return `<div class="sortable-table__cell">
          ${new Date(date).toLocaleDateString()}
        </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Price',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
          ${data}
        </div>`;
    }
  },
];

export default header;
