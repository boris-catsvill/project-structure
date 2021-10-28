const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'User',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Created At',
    sortable: true,
    sortType: 'date',
    template: data => {
      const date = new Date(data);

      return `<div class="sortable-table__cell">
                ${date.toLocaleString('ru', {dateStyle: 'medium'})}
              </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Total Cost',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">$${data.toLocaleString('en-US')}</div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Delivery',
    sortable: true,
    sortType: 'number',
  },
];

export default header;
