const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Client',
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
            ${new Date(data).toLocaleString('ru', { day: 'numeric', month: 'short', year: 'numeric'})}
          </div>
        `;
    }
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `
          <div class="sortable-table__cell">
            $${new Intl.NumberFormat('ru-RU').format(data)}
          </div>
        `;
    }
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string'
  }
];

export default header;