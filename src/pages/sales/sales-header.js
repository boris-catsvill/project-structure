const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Name',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'number',
    template: data => { 
      data = new Date(data)
      return `<div class="sortable-table__cell">${`${data.getDate()} ${new Intl.DateTimeFormat('en-US', {month: 'short'}).format(data)} ${data.getFullYear()}`}</div>`
    }
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: 'number',
    template: data => { return `<div class="sortable-table__cell">$${data}</div>`}
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
