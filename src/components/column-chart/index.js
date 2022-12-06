import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

  chartHeight = 50;

  constructor({
                url = '',
                range: {from = new Date(), to = new Date()} = {},
                label = '',
                link = '',
                formatHeading = data => data
              } = {}) {
    this.value = 0;
    this.data = [];
    this.url = url;
    this.url = new URL(url, BACKEND_URL);
    this.from = from;
    this.to = to;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.update();
  }

  async loadData(from, to){
    this.url.searchParams.set('from', from.toISOString().split('T')[0]);
    this.url.searchParams.set('to', to.toISOString().split('T')[0]);

    try {
      return await fetchJson(this.url);
    }catch (error){
      console.log(error.message)
    }
  }

  async update(from = this.from, to = this.to) {
      const response = await this.loadData(from, to);
      this.data = Object.values(response);
      this.returnData = response;

    this.subElements.header.innerHTML = this.formatHeading(this.data.reduce((sum, elem) => {
      return sum + elem;
    }));
    this.element.classList.remove("column-chart_loading");
    this.renderColumnList()

    return this.returnData;
  }

  renderColumnList() {
    const divColumnList = document.createElement('div');
    divColumnList.innerHTML = this.getColumnList();

    this.columnList = divColumnList.children;

    this.subElements.body.innerHTML = '';
    this.subElements.body.append(...this.columnList)
  }


  getTemplate() {
    return `
    <div class="column-chart dashboard__chart_${this.label} column-chart_loading" style="--chart-height: 50">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">USD ${this.value}</div>
        <div data-element="body" class="column-chart__chart">
            ${this.getColumnList()}
        </div>
      </div>
    </div>
    `
  }

  getLink() {
    return (this.link)
      ? `<a href="${this.link}" class="column-chart__link">Подробнее</a>`
      : '';
  }

  getColumnList() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(column => {
        return `<div style="--value: ${Math.floor(column * scale)}" data-tooltip="${(column / maxValue * 100).toFixed(0) + '%'}"></div>`;
      }
    ).join("");
  }

  render() {
    const divColumnChart = document.createElement('div');
    divColumnChart.innerHTML = this.getTemplate();

    this.element = divColumnChart.firstElementChild;
    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
    this.subElements = this.getSubElements()
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]')

    for (let subElement of elements) {
      const name = subElement.dataset.element

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove()
    }
  }

  destroy() {
    this.remove();
  }
}

