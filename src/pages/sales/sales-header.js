const header = [
  {
    id: 'id',
    title: 'ID',
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
    sortType: 'number',
    template: date => {
      return `<div class="sortable-table__cell">
      ${new Date(date).toLocaleString('en-EN', { year: 'numeric', month: 'short', day: 'numeric' })}
    </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: 'number',
    template: cost => {
      return `<div class="sortable-table__cell">
      $${cost}
    </div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Delivery',
    sortable: true,
    sortType: 'number',
    template: delivery => {
      return `<div class="sortable-table__cell">
          ${delivery === 'Доставлено' ? 'Delivered' : 'In transit'}
        </div>`;
    }
  }
];

export default header;
