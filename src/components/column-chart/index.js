import fetchJson from '../../utils/fetch-json';

export default class ColumnChart {
  data = [];
  subElements = {};
  chartHeight = 50;

  constructor({
    url = '',
    label = '',
    link = '',
    value = 0,
    formatHeading = arg => arg,
    range = { from: new Date(), to: new Date() }
  } = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.label = label;
    this.formatHeading = formatHeading;
    this.value = this.formatHeading(value);
    this.link = link;
    this.range = range;

    this.render();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  get template() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${
      this.chartHeight
    }">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
          ${this.getData()}
        </div>
      </div>`;
  }

  getLink() {
    if (!this.link) return '';

    return `<a href="${this.link}" class="column-chart__link">
      View all
    </a>`;
  }

  getData() {
    return this.getColumnProps(this.data)
      .map(
        ({ value, percent }) => `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
      )
      .join('');
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;

    if (this.data.length > 0) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements();

    const { from, to } = this.range;
    this.update(from, to);
  }

  async update(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    this.element.classList.add('column-chart_loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('column-chart_loading');

    this.data = Object.values(data);

    this.value = this.data.reduce((result, current) => result + current, 0);
    this.subElements.header.innerHTML = this.formatHeading(this.value);
    this.subElements.body.innerHTML = this.getData();

    return data;
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  getSubElements() {
    const result = {};

    const subElements = this.element.querySelectorAll('[data-element]');

    for (let element of subElements) {
      const name = element.dataset.element;
      result[name] = element;
    }

    return result;
  }
}
