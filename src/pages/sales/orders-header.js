

const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number',
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
      const date = new Date(data);
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      const createdAt = date.toLocaleString('ru', options);
      return `<div class="sortable-table__cell" data-id="${data}">
          ${createdAt}
          </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `<div class="sortable-table__cell" data-id="${data}">
        $${data}
        </div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string',
  },
];

export default header;


// formatHeading: data => `$${data}`
// this.formatHeading = formatHeading;
