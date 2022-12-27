import fetchJson from '../../utils/fetch-json.js';
import vars from '../../utils/vars.js';

export default class ColumnChart {
  element;
  subElements;
  data;

  constructor({url = '', range = {from: new Date(), to: new Date()}, label = '', link = '', formatHeading = (str => `${str}`)} = {}) {
    this.url = new URL(url, vars.BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    const data = await fetchJson(this.url);
    return data;
  }

  async update(dateFrom, dateTo) {
    this.element.classList.add('column-chart_loading');

    const data = await this.loadData(dateFrom, dateTo);
    this.setNewRange(dateFrom, dateTo);

    this.subElements.header.innerHTML = this.formatHeading(this.getHeader(data));
    this.subElements.body.innerHTML = this.getBody(data);

    this.element.classList.remove('column-chart_loading');

    this.data = data;
    return this.data;
  }

  setNewRange(dateFrom, dateTo) {
    this.range.from = dateFrom;
    this.range.to = dateTo;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  getHeader(data) {
    const valuesSum = Object.values(data).reduce((sum, el) => (sum + el), 0);
    return valuesSum;
  }

  getBody(data) {
    const dataArray = Object.values(data);
    const maxData = Math.max(...dataArray) || 1;
    const basis = this.chartHeight / maxData;
    const newDataStr = dataArray.map(item => {
        return `<div style="--value: ${Math.floor(item * basis)}" data-tooltip="${(item / maxData * 100).toFixed(0)}%"></div>`
      }).join('');

    return newDataStr;
  }

  getTemplate() {
    const linkA = this.link ? `<a href=${this.link} class="column-chart__link">View all</a>` : '';

    return `
            <div class="column-chart column-chart_loading" style="--chart-height:  ${this.chartHeight}">
              <div class="column-chart__title">
                Total ${this.label}
                ${linkA}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header"></div>
                <div data-element="body" class="column-chart__chart"></div>
              </div>
            </div>
          `;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
