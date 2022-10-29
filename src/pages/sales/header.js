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
    sortType: 'string',
    template: data => {
      const date = new Date(data);
      let month = date.toLocaleString('ru', {month: 'short'});
      month = month.at(0).toLocaleUpperCase() + month.slice(1);
      const value = `${month} ${date.getDate()}, ${date.getFullYear()}`;
      return `
        <div class="sortable-table__cell">
            ${value}
        </div>
      `;
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
            $${data}
        </div>
      `;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  },
];

export default header;
