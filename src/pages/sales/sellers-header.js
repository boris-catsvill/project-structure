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
        sortType: 'number',
        template: data => {
            const date = new Date(data);

            return `<div class="sortable-table__cell">
            ${date.getMonth() + 1}.${date.getDate()}.${date.getFullYear()}
            </div>`;
        }
    },
    {
        id: 'totalCost',
        title: 'Const',
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
        title: 'Delivery',
        sortable: true,
        sortType: 'string'
    }
];

export default header;
