const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true,
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true,
  },
  {
    id: 'createdAt',
    title: 'Дата',
    sortable: true,
    template: data => {
      return `${new Date(data).toISOString().split('T')[0]}`;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
  },
];

export default header;
