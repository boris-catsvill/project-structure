const salesHeader = [
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
    sortType: 'string',
    template: data => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const date = new Date(data).toLocaleDateString('en-EN', options);
      return `
          <div class="sortable-table__cell">${date}</div>
        `;
    }
  },
  {
    id: 'totalCost',
    title: 'Total Cost',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string',
  },
];

export default salesHeader;
