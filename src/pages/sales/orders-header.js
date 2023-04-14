const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'string'
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
    template: data => {
      return `<div class="sortable-table__cell">
        ${new Date(data).toLocaleDateString('ru-RU')}
      </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
        $${data}
      </div>`;
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
