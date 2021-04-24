const salesHeader = [
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
        return `<div class="sortable-table__cell">
            ${new Date(Date.parse(data)).toLocaleString('ru', {year: "numeric", month: "short", day: "numeric"})}
          </div>`;
      },
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
      },
    },
    {
      id: 'delivery',
      title: 'Status',
      sortable: true,
      sortType: 'number',
    },
  ];
  
  export default salesHeader;