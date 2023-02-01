import SortableTable from '../../components/sortable-table';
import RangePicker from '../../components/range-picker';
import header from './header-config';

export default class Page {
	element;
	components = {};
	range = {
		from: new Date(),
		to: new Date()
	};

	getTemplate() {
		return `
			<div class="sales full-height flex-column">
				<div class="content__top-panel">
					<h1 class="page-title">Продажи</h1>
				</div>
				<div data-element="ordersContainer" class="full-height flex-column"></div>
			</div>
		`;
	}

	initComponents() {
		const { from, to } = this.range;

		const sortableTable = new SortableTable(header, {
			url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
			isSortLocally: false,
			sorted: {
				id: 'createdAt',
				order: 'desc'
			}
		});

		const rangePicker = new RangePicker({
			from,
			to
		});

		this.components = {
			sortableTable,
			rangePicker
		}
	}

	renderComponents() {
		const topPanel = this.element.querySelector('.content__top-panel');
		const ordersContainer = this.element.querySelector('[data-element="ordersContainer"]');

		topPanel.append(this.components.rangePicker.element);
		ordersContainer.append(this.components.sortableTable.element);
	}

	render() {
		const wrapper = document.createElement('div');

		wrapper.innerHTML = this.getTemplate();

		this.element = wrapper.firstElementChild;

		this.initComponents();
		this.renderComponents();
		this.initEventListeners();

		return this.element;
	}

	sortableTableUpdate(from, to) {
		this.components.sortableTable.destroy();

		this.components.sortableTable = new SortableTable(header, {
			url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
			isSortLocally: false,
			sorted: {
				id: 'createdAt',
				order: 'desc'
			}
		});

		const ordersContainer = this.element.querySelector('[data-element="ordersContainer"]');
		ordersContainer.append(this.components.sortableTable.element);
	}

	initEventListeners() {
		this.element.addEventListener('date-select', event => {
			const { from, to } = event.detail;

			this.sortableTableUpdate(from, to);
		});
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}