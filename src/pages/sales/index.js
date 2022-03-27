import RangePicker from '../../components/range-picker/index';
import SortableTable from '../../components/sortable-table';
import { headers } from './sales-headers';
import fetchJson from '../../utils/fetch-json';

export default class Page {
  element = {};
  subElements = {};
  components = {};
  url = new URL('api/rest/orders', process.env.BACKEND_URL);
  data = [];

  get template() {
    return `
      <div class="sales full-height flex-column">
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div class="rangepicker" data-element="rangePicker"></div>
        </div>
        <div class="full-height flex-column" data-element="sortableTable"></div>
      </div>
    `;
  }

  loadData = async (from, to) => {
    this.url.searchParams.set('createdAt_gte', from);
    this.url.searchParams.set('createdAt_lte', to);

    return await fetchJson(this.url);
  };

  render = () => {
    const wrapper = document.createElement('div');
    wrapper.insertAdjacentHTML('beforeend', this.template);
    this.element = wrapper.firstElementChild;

    this.getSubElements();
    this.getComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  };

  getSubElements = () => {
    this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  };

  getComponents = () => {
    const to = new Date();
    const from = new Date();
    from.setMonth(to.getMonth() - 1);
    this.url.searchParams.set('createdAt_gte', from.toISOString());
    this.url.searchParams.set('createdAt_lte', to.toISOString());
    this.url.searchParams.set('_sort', 'createdAt');
    this.url.searchParams.set('_order', 'desc');
    
    const rangePicker = new RangePicker({
      to,
      from,
    });

    const sortableTable = new SortableTable(headers, {
      url: this.url,
      isNotLinkRow: true,
    });

    this.components = {
      rangePicker,
      sortableTable,
    };
  };

  initEventListeners = () => {
    this.element.querySelector('.rangepicker').addEventListener('date-select', async event => {
      const {from, to} = event.detail;
      const data = await this.loadData(from.toISOString(), to.toISOString());

      this.components.sortableTable.update(data);
    });
  };

  renderComponents = () => {
    Object.keys(this.components).forEach(item => {
      this.subElements[item].append(this.components[item].element);
    });
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    Object.values(this.components).forEach(item => {
      item.destroy();
    });
    this.components = null;
    this.element = null;
  };
}