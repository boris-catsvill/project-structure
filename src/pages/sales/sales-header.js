const numFormat = new Intl.NumberFormat("en");
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
    sortType: 'string',
    template: data => {
      return `
          <div class="sortable-table__cell">
            ${new Date(Date.parse(data)).toLocaleString('ru', {year: 'numeric', month: 'short', day: 'numeric'})}
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
      return `<div class="sortable-table__cell">$${numFormat.format(data)}</div>`;
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
