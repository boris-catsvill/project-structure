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
    title: 'Created at',
    sortable: true,
    sortType: 'custom',
    template: data => {
      const date = new Date(data).toLocaleString('ru', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      return `<div class="sortable-table__cell">
            ${date}
          </div>`;
    },
    customSorting: (prevItem, nextItem) => {
      const prevDate = new Date(prevItem);
      const nextDate = new Date(nextItem);

      return prevDate - nextDate;
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
