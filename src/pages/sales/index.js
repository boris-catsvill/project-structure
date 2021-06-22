import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import columns from './columns.js';


const today = new Date();
const monthAgo = new Date();
monthAgo.setMonth(today.getMonth() - 1);

export default class Page {
  element = null;
  subElements = {};

  table  =  null;

  onDateChange = async ({ detail: { dateFrom, dateTo } }) => {
    await this.loadData(dateFrom, dateTo);
  };


  async loadData(from, to) {
    return this.table.loadTableData({ from, to });
  }

  get template() {
    return `<div class='dashboard'>
    <div class='content__top-panel'>
    <h2 class='page-title'>Продажи</h2>
    <div data-element='rangePicker'></div>
    </div>
      <div data-element='sortableTable'>
      </div>
    </div>`;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async render() {
    this.table = new SortableTable(columns, {
      url: 'api/rest/orders',
      infinite: true,
      isSortLocally: false,
      range: [monthAgo, today],
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
      requestParamsConverter: ({from,to,...params}) => {
        const result = {...params};
        if (from) {
          result.createdAt_gte = from;
        }

        if (to) {
          result.createdAt_lte = to;
        }

        return result;
      }
    });

    const container = document.createElement('div');

    container.innerHTML = this.template;
    this.element = container.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.sortableTable.append(this.table.element);

    this.element.addEventListener('date-selected', this.onDateChange);
    return this.element;
  }


  remove() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
