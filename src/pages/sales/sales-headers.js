const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Clients',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell">
            ${new Date(data).toDateString()}
          </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Price',
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
    sortType: 'string',
    template: data => {
      return `<div class="sortable-table__cell">
            ${data}
          </div>`;
    }
  }
];

export default header;
