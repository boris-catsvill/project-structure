import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
    chartHeight = 50;
    subElements = {};
    element;

    constructor({
        url = '',
        range = { from: new Date(), to: new Date()},
        label = "", 
        link = "", 
        formatHeading = data => data} = {}) {
       this.url = new URL(url, BACKEND_URL);
       this.range = range;
       this.label = label;
       this.link = link;
       this.formatHeading = formatHeading;
       this.render();
       this.update(this.range.from, this.range.to);
    }

    getTemplate() {
        return `
            <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.label}
                    ${this.getLink()}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        
                    </div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.getColumn()}
                    </div>
                </div>
            </div>
        `
    }

    getLink() {
        return this.link ? `<a href="${this.link} class="column-chart__link">View all</a>` : '';
    }



    getColumn(data = []) {
        const maxValue = Math.max(...data);
        const scale = this.chartHeight / maxValue;

        return data.map(item => {
            const percent = ((item / maxValue) * 100).toFixed(0);

            return `
                <div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>
            `
        }).join("");
    }

    render() {
        const element = document.createElement("div");

        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements();
    }

    loadData(from = this.range.from, to = this.range.to) {
        this.url.searchParams.set('from', from.toISOString());
        this.url.searchParams.set('to', to.toISOString());

        return fetch(this.url)
            .then(response => {
                const data = response.json();
                return data;
            }).then(data => {
                return data;
            })
    }

    getSubElements() {
        const result = {};

        const elements = this.element.querySelectorAll("[data-element]");

        for (const subElement of elements) {
            const name = subElement.dataset.element;

            result[name] = subElement;
        }

        return result;
    }

    getHeaderValue(arr) {
        return arr.reduce((sum, current) => sum + current, 0);
    }

    async update(from, to) {
        this.element.classList.add('column-chart_loading');
        this.subElements.header.textContent = '';
        this.subElements.body.innerHTML = '';

        const data = await this.loadData(from, to);
        const dataArr = Object.values(data);

        if(data && dataArr.length) {
          this.subElements.header.textContent = this.getHeaderValue(dataArr);
          this.subElements.body.innerHTML = this.getColumn(dataArr);

          this.element.classList.remove('column-chart_loading');
        }
      }

    remove() {
        if (this.element) {
          this.element.remove();
        }
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
      }
}