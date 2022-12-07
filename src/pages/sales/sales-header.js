const header = [
    {
        id: 'id',
        title: 'ID',
        sortable: true,
    },
    {
        id: 'user',
        title: 'Client',
        sortable: true,
    },
    {
        id: 'createdAt',
        title: 'Date',
        sortable: true,
        formatData: data => new Date(data).toLocaleString('ru', { dateStyle: 'medium' }),
    },
    {
        id: 'totalCost',
        title: 'Price',
        sortable: true,
        formatData: data => '$' + data,
    },
    {
        id: 'delivery',
        title: 'Status',
        sortable: true,
    },
];

export default header;
