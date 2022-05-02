export default [
  {
    id: 'id',
    title: 'Id',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Customer',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'date',
    template: data => {
      return `<div class="sortable-table__cell">
        ${new Date(data).toLocaleString("en-US", { year: 'numeric', month: 'short', day: 'numeric'})}
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
        $${data.toLocaleString("en-US")}
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