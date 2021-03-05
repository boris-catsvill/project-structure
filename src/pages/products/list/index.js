import SortableTable from "../../../components/sortable-table";
import fetchJson from '../../../utils/fetch-json';
import header from "./products-header.js";

export default class Page {
	element;
	subElements = {};
	components = {};

	initComponents() {
		this.components.sortableTable = new SortableTable(header, {
			url: `api/rest/products?_embed=subcategory.category`, linkId: 'id'
		});
	}

	async render() {
		const element = document.createElement('div');
		element.innerHTML = this.template;
		this.element = element.firstElementChild;
		this.subElements = this.getSubElements(this.element);
		this.initComponents();
		this.renderComponents();
		this.initEventListeners();
		return this.element;
	}

	get template() {
		return `
			<div class="product-list">
				<div class="content__top-panel">
					<h1 class="page-title" title="Pizda">Товары</h1>
					<a href="/products/add" class="button-primary">Добавить товар</a>
				</div>
				<div class="content-box content-box_small">
					<form class="form-inline">
						<div class="form-group">
							<label class="form-label">Сортировать по:</label>
							<input type="text" class="form-control" id="text-filter" placeholder="Название товара">
						</div>
						<div class="form-group">
							<label class="form-label">Статус:</label>
							<select id="status-filter" class="form-control">
							<option value="" selected="">Любой</option>
							<option value="1">Активный</option>
							<option value="0">Неактивный</option>
							</select>
						</div>
					</form>
				</div>
				<div data-element="sortableTable" class="products-list__container"></div>
			</div>
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
		const textFilter = this.element.querySelector('#text-filter');
		textFilter.addEventListener('input', async () => {
			this.components.sortableTable.start = 0;
			if (textFilter.value !== '' && !textFilter.value !== undefined && textFilter.value !== null) {
				this.components.sortableTable.url.searchParams.set('title_like', textFilter.value);
			} else {
				this.components.sortableTable.url.searchParams.delete('title_like');
			}
			const newProductsData = await this.components.sortableTable.loadData();
			this.components.sortableTable.addRows(newProductsData);
		});
		const statusFilter = this.element.querySelector('#status-filter');
		statusFilter.addEventListener('input', async () => {
			this.components.sortableTable.start = 0;
			if (statusFilter.value !== '' && !statusFilter.value !== undefined && statusFilter.value !== null) {
				this.components.sortableTable.url.searchParams.set('status', statusFilter.value);
			} else {
				this.components.sortableTable.url.searchParams.delete('status');
			}
			const newProductsData = await this.components.sortableTable.loadData();
			this.components.sortableTable.addRows(newProductsData);
		});
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}