export default [
  {
    id: 'id',
    title: "ID",
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'user',
    title: "Клиент",
    sortable: true,
    sortType: 'string'
  },
  {
    id: 'createdAt',
    title: "Дата",
    sortable: true,
    sortType: 'date',
    template: data => {
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      
      return `
        <div class="sortable-table__cell">
          ${new Date(data).toLocaleDateString("en-US", options)}
        </div>
      `;
    }
  },
  {
    id: 'totalCost',
    title: "Стоимость",
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'delivery',
    title: "Статус",
    sortable: true,
    sortType: 'string'
  }
];