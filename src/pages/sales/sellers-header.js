const header = [
    {
      id: 'id',
      title: 'id',
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
          const date = new Date( Date.parse(data));
          const srtFormst = date.toLocaleString("ru", //"en" 
            { year: "numeric", 
              month: "short", //"long" 
              day: "numeric"});
          return `<div class="sortable-table__cell">
              ${srtFormst}  
            </div>`;
        }
      },    
    {
      id: 'totalCost',
      title: 'amount',
      sortable: true,
      sortType: 'number'
    },
    {
      id: 'delivery',
      title: 'Status',
      sortable: true,
      sortType: 'custom'
    },
  ];
  
  export default header;
  