import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './orders-header.js';

import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

	element;
	subElements = {};
	components = {};
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

	async updateComponents() {
		const data = await this.loadData();

		this.components.sortableTable.renderRows(data);
	}

	loadData() {
		Object.keys(this.searchParams).map(key => {
			this.url.searchParams.set(key, this.searchParams[key]);
		});

		/* this.url.searchParams.set('_start', '0');
		this.url.searchParams.set('_end', '30');
		this.url.searchParams.set('_sort', 'createdAt');
		this.url.searchParams.set('_order', 'desc');
		this.url.searchParams.set('createdAt_gte', from.toISOString());
		this.url.searchParams.set('createdAt_lte', to.toISOString()); */

		return fetchJson(this.url);
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
			/* url: `api/dashboard/bestsellers?_start=1&_end=21&from=${from.toISOString()}&to=${to.toISOString()}&_sort=title&_order=asc`, */
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
			const { element } = this.components[componentName];

			root.append(element);
		});
	}

	template() {
		return `
			<div class="sales full-height flex-column">
				<div class="content__top-panel" data-element="rangePicker">
					<h1 class="page-title">Sales</h1>	
				</div>
				<div class="full-height flex-column" data-element="sortableTable">
				</div>
			</div>
			`;
	}

	getSubElements() {
		const subElements = this.element.querySelectorAll('[data-element]');

		return [...subElements].reduce((accum, subElement) => {
			accum[subElement.dataset.element] = subElement;

			return accum;
		}, {});
	}

	render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.template();

		this.element = wrapper.firstElementChild;

		this.subElements = this.getSubElements();

		this.initComponents();
		this.renderComponents();
		this.initEventListeners();
		return this.element;
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