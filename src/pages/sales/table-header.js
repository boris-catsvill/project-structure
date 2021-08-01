const tableHeader = [
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
      return `
          <div class="sortable-table__cell">
           ${date.getDate()} ${date.toLocaleDateString('en', {month: 'short'})} ${date.getFullYear()}
          </div>
        `;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">$${data}</div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string',
  },
];

export default tableHeader;
