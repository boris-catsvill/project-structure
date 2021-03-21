import fetchJson from '../../utils/fetch-json.js';

const REQUEST_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    data = [];
    subElements = {};

    constructor({
        url = '',
        range = {
            from: new Date(),
            to: new Date(),
        },
        label = '',
        link = '',
        chartHeight = 50,
        formatHeading = data => data,
    } = {}) {
        this.url = new URL(url, REQUEST_URL);
        this.range = range;
        this.label = label;
        this.link = link;
        this.chartHeight = chartHeight;
        this.formatHeading = formatHeading;

        this.render();
    }

    getUrl(from, to) {
        this.url.searchParams.set('from', from.toISOString());
        this.url.searchParams.set('to', to.toISOString());
    }

    async getDataRequest(from, to) {
        this.element.classList.add('column-chart_loading');
        this.subElements.header.textContent = '';
        this.subElements.body.innerHTML = '';

        this.getUrl(from, to);

        const response = await fetchJson(this.url);
        const data = Object.values(response);

        this.range = {from, to};

        if (response && data.length) {
            this.subElements.header.innerHTML = this.getHeaderTotalValue(data);
            this.subElements.body.innerHTML = this.getBody(data);

            this.element.classList.remove('column-chart_loading');
        }
    }

    getTitle(label, link) {
        return `
            <div class="column-chart__title">
                Total ${label}
                ${link ? `<a href="/${link}" class="column-chart__link">View all</a>` : ''}
            </div>
        `;
    }

    getColumnProps(data) {
        const maxValue = Math.max(...data);
        const scale = 50 / maxValue;

        return data.map(item => {
            return {
                percent: (item / maxValue * 100).toFixed(0) + '%',
                value: String(Math.floor(item * scale))
            };
        });
    }

    getBody(data) {
        return this.getColumnProps(data).map(item => {
            return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`
        }).join('');
    }

    getHeaderTotalValue = data => data.length ? this.formatHeading([...data].reduce((sum, item) => sum + item)) : '';

    render() {
        const {range, label, link, chartHeight} = this;

        const element = document.createElement('div');
        
        element.innerHTML = `
            <div class="column-chart column-chart_loading" style="--chart-height: ${chartHeight}">
                ${this.getTitle(label, link)}
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header"></div>
                    <div data-element="body" class="column-chart__chart"></div>
                </div>
            </div>
        `;
    
        this.element = element.firstElementChild;

        this.subElements = this.getSubElements(this.element);

        this.getDataRequest(range.from, range.to);
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((memo, item) => {
            memo[item.dataset.element] = item;
    
            return memo;
        }, {});
    }

    async update(from, to) {
        return await this.getDataRequest(from, to);
    }

    remove() {
        this.element.remove();
    }
    
    destroy() {
        this.remove();
    }
}
