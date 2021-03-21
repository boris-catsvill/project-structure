const header = [
    {
        id: 'id',
        title: 'ID',
        sortable: true,
        sortType: 'number'
    }, {
        id: 'user',
        title: 'Клиент',
        sortable: true,
        sortType: 'string'
    }, {
        id: 'createdAt',
        title: 'Дата',
        sortable: true,
        sortType: 'date',
        template: data => {
            return `
                <div class="sortable-table__cell">
                    ${new Date(data).toLocaleDateString('ru', {month: 'short', day: '2-digit', year: 'numeric'})}
                </div>
            `;
        }
    }, {
        id: 'totalCost',
        title: 'Стоимость',
        sortable: true,
        sortType: 'formattedNumber',
        template: data => {
            return `
                <div class="sortable-table__cell">
                    $${data}
                </div>
            `;
        }
    }, {
        id: 'delivery',
        title: 'Статус',
        sortable: true,
        sortType: 'delivery',
    },
];
  
  export default header;