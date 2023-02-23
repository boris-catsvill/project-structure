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
    sortType: 'date',
    template: date =>
      new Date(date).toLocaleDateString('ru', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: item => `$${item}`
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  }
];

export default header;

{
  /* <div class="sortable-table__cell" data-name="id" data-sortable="">
          <span>ID</span>
        </div>
        <div class="sortable-table__cell" data-name="user" data-sortable="">
          <span>Клиент</span>
        </div>
        <div class="sortable-table__cell" data-name="createdAt" data-sortable="">
          <span>Дата</span>
          <span class="sortable-table__sort-arrow">
            <span class="sortable-table__sort-arrow_desc"></span>
          </span>
        </div>
        <div class="sortable-table__cell" data-name="totalCost" data-sortable="">
          <span>Стоимость</span>
        </div>
        <div class="sortable-table__cell" data-name="delivery" data-sortable="">
          <span>Статус</span>
        </div> */
}
