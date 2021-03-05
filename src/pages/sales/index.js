import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from "./sales-header.js";

export default class Page {
	element;
	subElements = {};
	components = {};

	constructor() {
		const date = new Date();
		this.to = new Date(date);
		this.from = new Date(date.setMonth(date.getMonth() - 1));
	}

	initComponents() {
		this.components.rangePicker = new RangePicker({
			from: this.from,
			to: this.to
		});
		this.components.sortableTable = new SortableTable(header, {
			url: `api/rest/orders?createdAt_gte=${this.from.toISOString()}&createdAt_lte=${this.to.toISOString()}`,
			sorted: {
				id: 'createdAt',
				order: 'desc'
			},
		});
	}

	async render() {
		this.element = document.createElement('div');
		this.element.innerHTML = this.template;
		this.subElements = this.getSubElements(this.element);
		this.initComponents();
		this.renderComponents();
		this.initEventListeners();
		return this.element;
	}

	get template() {
		return `
			<div class="content__top-panel">
				<h1 class="page-title">Продажи</h1>
				<div data-element="rangePicker"></div>
			</div>
			<div data-element="sortableTable"></div>
		`;
	}
	renderComponents() {
		Object.keys(this.components).forEach(component => {
			const root = this.subElements[component];
			const { element } = this.components[component];
			root.append(element);
		});
	}
	getSubElements(element) {
		const elements = element.querySelectorAll('[data-element]');
		return [...elements].reduce((accum, item) => {
			accum[item.dataset.element] = item;
			return accum;
		}, {});
	}

	initEventListeners() {
		this.subElements.rangePicker.addEventListener('date-select', async (event) => {
			this.from = event.detail.from;
			this.to = event.detail.to;
				if (this.from) {
					this.components.sortableTable.url.searchParams.set('createdAt_gte', this.from);
				} else {
					this.components.sortableTable.url.searchParams.delete('createdAt_gte');
				}
				if (this.to) {
					this.components.sortableTable.url.searchParams.set('createdAt_lte', this.to);
				} else {
					this.components.sortableTable.url.searchParams.delete('createdAt_lte');
				}
			const salesData = await this.components.sortableTable.loadData();
			this.components.sortableTable.addRows(salesData);
		});
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}