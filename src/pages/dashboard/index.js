import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import ColumnChart from '../../components/column-chart/index.js';
import header from './bestsellers-header.js';

export default class Page {
    element;
    subElements;

    updateComponent(date) {
        const now = date || new Date();

        const range = date || {
            to: new Date(),
            from: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        }

        this.subElements.rangePicker.innerHTML = '';
        this.subElements.columnChart.innerHTML = '';
        this.subElements.sortableTable.innerHTML = '';

        for (const [key, value] of Object.entries(this.columnChart(range))) {
            value.className += ` dashboard__chart_${key}`;

            this.subElements[`${key}Chart`] = value;

            this.subElements.columnChart.append(value);
        }

        this.subElements.rangePicker.append(this.rangepicker(range));
        this.subElements.sortableTable.append(this.sortableTable(range));
    }

    render() {
        const element = document.createElement('div');

        element.innerHTML = this.template();

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.updateComponent();
        this.element.addEventListener('date-select', this.initEvent);

        return this.element;
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    template() {
        return `<div class="dashboard full-height flex-column">
            <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
                <div class="rangepicker" data-element="rangePicker"></div>
            </div>
            <div class="dashboard__charts" data-element="columnChart"></div>
            <h3 class="block-title">Лидеры продаж</h3>
            <div class="sortable-table" data-element="sortableTable"></div>
        </div>`;
    }

    rangepicker(range) {
        return new RangePicker(range).element;
    }

    sortableTable(range) {
        const url = this.linkAttributes({
            from: range.from.toISOString(),
            to: range.to.toISOString(),
        }, 'api/dashboard/bestsellers');

        return new SortableTable(header, {url, isSortLocally: true}).element;
    }

    columnChart(range) {
        const ordersChart = new ColumnChart({
            url: 'api/dashboard/orders',
            range,
            label: 'orders',
            link: '#'
        });

        const salesChart = new ColumnChart({
            url: 'api/dashboard/sales',
            range,
            label: 'sales',
            formatHeading: data => `$${data}`
        });

        const customersChart = new ColumnChart({
            url: 'api/dashboard/customers',
            range,
            label: 'customers',
        });

        return {
            orders: ordersChart.element,
            sales: salesChart.element,
            customers: customersChart.element
        }
    }

    linkAttributes(attr, path) {
        const url = new URL(path, process.env.BACKEND_URL);

        for (const [key, value] of Object.entries(attr)) {
            url.searchParams.set(key, value);
        }

        return url.href;
    }

    initEvent = ({detail}) => {
        this.updateComponent(detail);
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }

    remove() {
        this.element.removeEventListener('date-select', this.initEvent);

        this.element.remove();
    }
}
