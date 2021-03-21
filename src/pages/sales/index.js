import RangePicker from '../../components/range-picker/index.js';
import SortableTable from '../../components/sortable-table/index.js';
import header from './header.js';

export default class Page {
    element;
    subElements;

    render () {
        const element = document.createElement('div');

        element.innerHTML = `
            <div class="sales full-height flex-column">
                <div class="content__top-panel">
                    <h1 class="page-title">Продажи</h1>
                    <div class="rangepicker" data-element="rangePicker"></div>
                </div>
                <div class="sortable-table" data-element="sortableTable"></div>
            </div>
        `;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.updateComponent();
        this.element.addEventListener('date-select', this.initEvent);

        return this.element;
    }

    updateComponent(date) {
        const now = date || new Date();

        const range = date || {
            to: new Date(),
            from: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        }

        this.subElements.rangePicker.innerHTML = '';
        this.subElements.sortableTable.innerHTML = '';

        this.subElements.rangePicker.append(this.createRangePicker(range));
        this.subElements.sortableTable.append(this.createSortableTable(range));
    }

    createRangePicker(range) {
        return new RangePicker(range).element;
    }

    createSortableTable(range) {
        const url = this.linkAttributes({
            'createdAt_gte': range.from.toISOString(),
            'createdAt_lte': range.to.toISOString(),
            '_sort': 'createdA',
            '_order': 'desc',
            '_start': 0,
            '_end': 30,
        }, 'api/rest/orders');

        return new SortableTable(header, {url}).element;
    }

    initEvent = ({detail}) => {
        this.updateComponent(detail);
    }

    linkAttributes(attr, path) {
        const url = new URL(path, process.env.BACKEND_URL);

        for (const [key, value] of Object.entries(attr)) {
            url.searchParams.set(key, value);
        }

        return url.href;
    }

    getSubElements ($element) {
        const elements = $element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }
}
