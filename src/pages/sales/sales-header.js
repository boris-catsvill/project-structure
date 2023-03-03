const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
    sortType: 'number'
    
  },
  {
    id: 'user',
    title: 'User',
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: 'Date',
    sortable: true,
    sortType: 'date',
    template: data => {
      const date =  new Date(data)
      return `<div class="sortable-table__cell">${date.toLocaleDateString()}</div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Price',
    sortable: true,
    sortType: 'number',
    template: value => {
      return `<div class="sortable-table__cell">${'$' + value}</div>`
   
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



              
      



