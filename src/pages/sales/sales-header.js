import { LOCALE } from '../../constants/index.js';

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
    sortType: 'custom',
    sortFunction: (value1, value2) => new Date(value1).getTime() - new Date(value2).getTime(),
    template: data => {
      return `
        <div class='sortable-table__cell'>
          ${new Date(data).toLocaleDateString(LOCALE, { year: 'numeric', month: 'long', day: 'numeric' })}
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
        <div class='sortable-table__cell'>
          $${data.toLocaleString(LOCALE)}
        </div>
      `;
    }
  },
  {
    id: 'delivery',
    title: 'Статус',
    sortable: true,
    sortType: 'string',
  },
];

export default header;
