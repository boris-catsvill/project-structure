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
    sortType: 'string',
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'number',
    template: data => {
      const date = new Date(data);
      return `<div class="sortable-table__cell">
        ${date.toLocaleDateString('ru', { day: 'numeric', month: 'short', year: 'numeric' })}
      </div>`;
    },
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: 'number',
    template: data => `<div class="sortable-table__cell">
      ${data.toLocaleString(['en'], { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}
      </div>`,
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
