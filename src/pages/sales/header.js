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
    title: 'Date',
    sortable: true,
    sortType: 'date',
    template: data => {
      return `
        <div class="sortable-table__cell">
          ${new Date(data).toLocaleString('default', { dateStyle: 'medium' })}
        </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Total',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `
        <div class="sortable-table__cell">
          $${parseFloat(data).toLocaleString('en-US', { maximumFractionDigits: 2 })}
        </div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
