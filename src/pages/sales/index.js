import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './orders-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
	from = new Date(new Date().setMonth(new Date().getMonth() - 1));
	to = new Date();
	url = new URL('api/rest/orders', BACKEND_URL)
	searchParams = {
		_start: 0,
		_end: 30,
		_sort: 'createdAt',
		_order: 'desc',
		createdAt_gte: this.from.toISOString(),
		createdAt_lte: this.to.toISOString()
	}

  render() {
    const pageWrapper = document.createElement('div');
    pageWrapper.innerHTML = this.getPageHtml();
    this.element = pageWrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();
    return this.element;
  }

  getPageHtml() {
    return `
			<div class="sales full-height flex-column">
				<div class="content__top-panel" data-element="rangePicker">
					<h1 class="page-title">Sales</h1>
				</div>
				<div class="full-height flex-column" data-element="sortableTable">
				</div>
			</div>`;
  }

  getSubElements() {
    const subElements = {};
    this.element.querySelectorAll('[data-element]').forEach(subElement => {
      subElements[subElement.dataset.element] = subElement;
    });
    return subElements;
  }

  initComponents() {
    const now = new Date();
    const to = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));

    const rangePicker = new RangePicker({
      from,
      to,
    });
    const sortableTable = new SortableTable(header, {
      searchParams: this.searchParams,
      url: this.url,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      },
    });

    this.components = {
      rangePicker,
      sortableTable,
    }
  }

	renderComponents() {
		Object.keys(this.components).forEach(componentName => {
			const root = this.subElements[componentName];
			root.append(this.components[componentName].element);
		});
	}

	initEventListeners() {
		this.components.rangePicker.element.addEventListener('date-select', event => {
			const { from, to } = event.detail;

			this.from = from;
			this.to = to;
			this.searchParams.createdAt_gte = this.from.toISOString();
			this.searchParams.createdAt_lte = this.to.toISOString();

			this.updateComponents();
		});
	}

  async updateComponents() {
    Object.keys(this.searchParams).forEach(key => this.url.searchParams.set(key, this.searchParams[key]));
    const data = await fetchJson(this.url);
    this.components.sortableTable.renderRows(data);
  }

	remove() {
		if (this.element) {
			this.element.remove();
		}
	}

	destroy() {
		this.remove();
		this.element = null;
		this.subElements = null;
	}
}
