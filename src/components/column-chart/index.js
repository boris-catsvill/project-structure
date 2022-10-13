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
                    <div data-element="header" class="column-chart__header"></div>
                    <div data-element="body" class="column-chart__chart">
                        ${this.getColumn()}
                    </div>
                </div>
            </div>
        `
    }

    getLink() {
        return this.link ? `<a href="/sales" class="column-chart__link">View all</a>` : '';
    }

    createLocalyMounth() {
        let monthsLocaly = [];

        for (let i = 0; i < 12; i++)
        monthsLocaly.push(new Date(2000, i, 1).toLocaleDateString(undefined, { "month": "short" }));

        return monthsLocaly;
    }
    
    getColumn(data = [], from = this.range.from) {
        let today = new Date(from);

        const maxValue = Math.max(...data);
        let arr = [];
        const scale = this.chartHeight / maxValue;
        const mounth = this.createLocalyMounth();
    
        for (const columnValue of data) {
            const day = today.getDate();
            const mounthDate = mounth[today.getMonth()];
            const year = today.getFullYear();
            const multiplication = 24 * 60 * 60 * 1000;

            arr.push(`<div style="--value: ${Math.floor(columnValue * scale)}" data-tooltip="${this.createTooltipText(day, mounthDate, year, columnValue)}"></div>`);
            today = new Date(today.getTime() + (multiplication));
        }

        return arr.join("");
    }

    createTooltipText (day, mounthDate, year, columnValue) {
        return `
            <div>
                <small>
                    ${day} ${mounthDate} ${year} г.
                </small>
            </div>
            <strong>${this.formatHeading(columnValue)}</strong>
        `
    }

    render() {
        const element = document.createElement("div");

        element.innerHTML = this.getTemplate();

        this.element = element.firstElementChild;

        this.subElements = this.getSubElements();
        this.init();
    }

    init () {
        const elem = this.subElements.body;

        elem.addEventListener('mouseover', this.classHoverOutAdd);

        elem.addEventListener('mouseout', this.classHoverOutAdd);
    }

    classHoverOutAdd = (event) => {
        const target = event.target.closest('[data-tooltip]');
        const eventType = event.type;

        if (!target) return;
        if (target === null) return;

        if (eventType === 'mouseover') {
            this.subElements.body.classList.add('has-hovered');
            target.classList.add('is-hovered');
        }

        if (eventType === 'mouseout') {
            this.subElements.body.classList.remove('has-hovered');
            target.classList.remove('is-hovered');
        }
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

        if(data) {
          this.subElements.header.textContent = this.formatHeading(this.getHeaderValue(dataArr));
          this.subElements.body.innerHTML = this.getColumn(dataArr, from);

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