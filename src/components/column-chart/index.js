import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  cash = new Map();
  constructor({
    label = '',
    link = '',
    url = '',
    value = 0,
    range = {},
    formatHeading = data => data
  } = {}) {
    this.label = label;
    this.formatHeading = formatHeading;
    this.link = link;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.data = [];
    this.value = value;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  async loadData(from, to) {
    this.url.searchParams.set('from', from);
    this.url.searchParams.set('to', to);

    try {
      return await fetchJson(this.url);
    } catch (error) {
      console.log('Ошибка загрузки данных ' + error);
      throw new Error('Ошибка загрузки данных с сервера' + error);
    }
  }

  async update(from, to) {
    const [fromDate] = from.toISOString().split('T');
    const [toDate] = to.toISOString().split('T');

    if (this.cash.get(fromDate) === toDate && this.data.length) {
      return;
    }
    this.cash.clear();
    this.cash.set(fromDate, toDate);

    this.element.classList.add('column-chart_loading');
    const loadedData = await this.loadData(fromDate, toDate);
    this.data = Object.values(loadedData);

    if (this.data.length) {
      this.showNewData();
      this.element.classList.remove('column-chart_loading');
    }

    return loadedData;
  }

  showNewData() {
    this.value = this.data.reduce((accum, item) => (accum += item), 0);
    this.subElements.header.innerHTML = this.formatHeading(this.value);
    this.subElements.body.innerHTML = this.getColumnCharts(this.data);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const elem of elements) {
      const name = elem.dataset.element;
      result[name] = elem;
    }
    return result;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">Подробнее</a>` : '';
  }

  getColumnCharts(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    return data
      .map(item => {
        const percent = ((item / maxValue) * 100).toFixed(0);
        const value = String(Math.floor(item * scale));
        return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getTemplate() {
    return `<div class="column-chart column-chart_loading"
    style="--chart-height: ${this.chartHeight}">
    <div class="column-chart__title">
    ${this.label}
    ${this.getLink()}
    </div>
    <div class="column-chart__container">
    <div data-element="header" class="column-chart__header">${this.value}</div>
    <div data-element="body" class="column-chart__chart">
    ${this.getColumnCharts(this.data)}
    </div></div></div>
    `;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    this.cash = null;
  }
}
