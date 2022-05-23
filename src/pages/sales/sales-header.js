const salesHeader = [
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
    sortType: 'date',
    template: date => {
      return `
        <div class="sortable-table__cell">
          <span>${date}</span>
        </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: cost => {
      return `
        <div class="sortable-table__cell">
          <span>$${cost}</span>
        </div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  }
];

export default salesHeader;
