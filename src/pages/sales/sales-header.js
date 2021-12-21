const header = [
  {
    id: 'id',
    title: 'ID',
    sortable: true
  },
  {
    id: 'user',
    title: 'Клиент',
    sortable: true,
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
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
    sortable: true
  },
];

export default header;