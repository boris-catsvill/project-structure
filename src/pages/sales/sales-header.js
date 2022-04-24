import currenctyFormatter from '../../utils/currency-formatter';

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
    template: date => {
      const dateString = new Date(date).toString();
      const [, month, day, year] = dateString.split(' ');

      return `
        <div class="sortable-table__cell">
          <span>${day} ${month.slice(0, 3)} ${year}</span>
        </div>`;
    }
  },
  {
    id: 'totalCost',
    title: 'Стоимость',
    sortable: true,
    sortType: 'number',
    template: cost => {
      const formattedCost = currenctyFormatter.format(cost);

      return `
        <div class="sortable-table__cell">
          <span>${formattedCost}</span>
        </div>`;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string'
  }
];

export default header;
