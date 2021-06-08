import fetchJson from '../../utils/fetch-json.js';

/* eslint-disable no-undef */
export default class ColumnChart {
  thousandsSeparatorRegExp = /\B(?=(\d{3})+(?!\d))/g;
  chartIsLoadingClass = 'column-chart_loading';
  chartHeight = 50;

  range = {
    from: new Date(0),
    to: new Date(0)
  };
  subElements = {};
  value = 0;

  constructor({ url = '', range = {}, label = '', link = '', formatHeading = null } = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();

    this.update(range.from, range.to);
  }

  get template() {
    return `
      <div class="column-chart ${this.chartIsLoadingClass}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">${this.label}${this.link ? this.linkTemplate : ''}</div>
        <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
          ${this.bodyNodesTemplate}
        </div>
      </div>
    `;
  }

  get linkTemplate() {
    return `
       <a href="${this.link}" class="column-chart__link">View all</a>
    `;
  }

  getBodyNodesTemplate(data) {
    return this.getColumnProps(data).map(prop => `<div style="--value: ${prop.value}" data-tooltip="${prop.percent}"></div>`).join('');
  }

  getDataFromServer(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return fetchJson(this.url);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getSubElements(element = this.element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  async update(from, to) {
    if (this.range.from.getTime() !== from.getTime() || this.range.to.getTime() !== to.getTime()) {
      this.element.classList.add(this.chartIsLoadingClass);

      const data = await this.getDataFromServer(from, to);
      const dataValues = Object.values(data);

      this.range = { from, to };
      this.value = dataValues.reduce((a, b) => a + b, 0);
      this.subElements.header.textContent = this.formatHeading ? this.formatHeading(this.value).replace(this.thousandsSeparatorRegExp, ",") : this.value;
      this.subElements.body.innerHTML = this.getBodyNodesTemplate(dataValues);

      if (dataValues.length) {
        this.element.classList.remove(this.chartIsLoadingClass);
      }

      return data;
    }
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
