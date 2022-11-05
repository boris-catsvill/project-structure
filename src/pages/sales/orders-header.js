const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Дата',
    sortable: true,
    sortType: 'number',
    template: data => {
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const date = new Date(data.split("T")[0]);
      return `
        <div class="sortable-table__cell">
          ${date.toLocaleDateString('en-US', options)
        }
        </div > `;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: data => {
      return `
        <div class="sortable-table__cell">
        $${data.toLocaleString()}
        </div > `;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string',
    /* template: data => {
      return `< div class="sortable-table__cell" >
  ${ data > 0 ? 'Active' : 'Inactive' }
        </div > `;
    } */
  },
];

export default header;
