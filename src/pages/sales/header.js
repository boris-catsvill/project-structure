const header = [
   {
      id: 'id',
      title: 'ID',
      sortable: false,
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
         return `<div class="sortable-table__cell">
                ${new Date(data).toLocaleString('ru', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
         })}
               </div>`;
      },
   },
   {
      id: 'totalCost',
      title: 'Стоимость',
      sortable: true,
      sortType: 'number'
   },
   {
      id: 'delivery',
      title: 'Статус',
      sortable: true,
      sortType: 'number',
   },
];

export default header;