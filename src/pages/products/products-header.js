import escapeHtml from '../../utils/escape-html';
import { currencyFormat } from '../../utils/formatters';

const statues = ['Неактивен', 'Активен'];

export default [
  {
    id: 'images',
    title: 'Фото',
    sortable: false,
    template: data => {
      return `<img class='sortable-table-image' alt='Image' src='${escapeHtml(data[0]?.url)}'>`;
    }
  },
  {
    id: 'title',
    title: 'Название',
    sortable: true,
    sortType: 'string',
    template: (data, row) => `<a href='/products/${escapeHtml(encodeURI(row.id))}'>${escapeHtml(data)}</a>`
  },
  {
    id: 'subcategory',
    title: 'Категория',
    sortable: false,
    template: data => escapeHtml(data.title)
  },
  {
    id: 'quantity',
    title: 'Количество',
    sortable: true,
    sortType: 'number'
  },
  {
    id: 'price',
    title: 'Цена',
    sortable: true,
    sortType: 'number',
    template: data => escapeHtml(currencyFormat(data))
  },
  {
    id: 'status',
    title: 'Статус',
    sortable: true,
    sortType: 'number',
    template: data => escapeHtml(statues[data])
  }
];
