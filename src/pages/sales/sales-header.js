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
    title: 'Date',
    sortable: true,
    sortType: 'date',
    formatValue: data => {
      const month = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];

      const date = new Date(Date.parse(data));
      return `${date.getDate()} ${month[date.getMonth()]}. ${date.getFullYear()}г.`
    },
  },
  {
    id: 'totalCost',
    title: 'Cost',
    sortable: true,
    sortType: 'number',
    formatValue: data => `$${data}`,
  },
  {
    id: 'delivery',
    title: 'Status',
    sortable: true,
    sortType: 'string',
  },
];

export default header;
