export default class ColumnChart {
    constructor({
        label = '',
        link = '',
        formatHeading = data => data,
        url = '',
        range = {
            from: new Date(),
            to: new Date(),
        }
    } = {}) {
        this.data = [];
        this.label = label;
        this.link = link;
        this.chartHeight = 50;
        this.range = range;
        this.formatHeading = formatHeading;
        this.url = url;
        
        this.render();
        this.update(this.range.from, this.range.to);
    }

    getTemplate() { 
        return `
            <div class="column-chart column-chart_loading" --chart-height: ${this.chartHeight}>
                <div class="column-chart__title">
                        Total ${this.label}
                        <a href="${this.link}" class="column-chart__link">View all</a>
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header"></div>
                    <div data-element="body" class="column-chart__chart"></div>
                </div>
            </div>
        `
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getTemplate();     
        this.element = wrapper.firstElementChild;

        this.subElements = this.getSubElements(this.element.lastElementChild);
        wrapper.remove();
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
            return accum;
        }, {});
    }

    async update(from = new Date(), to = new Date()) { 

        this.element.classList.add('column-chart_loading');

        await this.takeData(from, to);

        this.element.classList.remove('column-chart_loading'); 

        const chartData = this.makeDataRightValue().map((item) => {
            return `<div style="--value: ${Math.floor(item)}" data-tooltip="${Math.round(item / this.chartHeight * 100)}%"></div>`
        });

        this.subElements['header'].innerHTML = this.value;
        this.subElements['body'].innerHTML = chartData.join('');
    }

    async takeData(from, to) { 
        const url = this.makeUrl(from, to);
        const response = await fetch(url.toString());
        const responseBody = await response.json();


        const data = Object.entries(responseBody);
        this.data = data.map(item => item[1]);
        this.value = this.data.reduce((a, b) => a + b);
    }

    makeUrl(from, to) { 
        const url = new URL(this.url, 'https://course-js.javascript.ru/');
        url.searchParams.set('from', from.toISOString());
        url.searchParams.set('to', to.toISOString());

        return url;
    }

    makeDataRightValue() { 
        const maxValue = Math.max(...this.data);
        const coefValues = this.chartHeight / maxValue;
        const newChartData = this.data.map(item => item * coefValues);

        return newChartData;
    }

    destroy() { 
        this.remove();
    }

    remove() {
        this.element.remove();
    }
}