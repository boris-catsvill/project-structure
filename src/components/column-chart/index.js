import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;

  constructor({
    url = '',
    base = BACKEND_URL,
    range = {},
    label = '',
    link = '',
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.url = url;
    this.base = base;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.value = formatHeading(value);

    this.render();
  }

  get template() {
    return `
        <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
            Total ${this.label}
            ${this.getLink()}
          </div>
          <div class="column-chart__container">
             <div data-element="header" class="column-chart__header">
               ${this.value}
             </div>
            <div data-element="body" class="column-chart__chart">
            </div>
          </div>
        </div>
      `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.update(this.range.from, this.range.to);
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getColumnBody(data = []) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data
      .map(item => {
        const percent = ((item / maxValue) * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(
          item * scale
        )}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  async update(from, to) {
    // Indicate that loading started
    this.element.classList.add('column-chart_loading');

    // Load data
    const data = await this.loadData(from, to);
    const values = Object.values(data);

    // Show recieved values
    this.subElements.body.innerHTML = this.getColumnBody(values);
    this.subElements.header.innerText = this.formatHeading(values.reduce((a, b) => a + b));
    this.element.classList.remove('column-chart_loading');
    return data;
  }

  async loadData(from, to) {
    const dataURL = new URL(this.url, this.base);
    dataURL.searchParams.set('from', from.toISOString());
    dataURL.searchParams.set('to', to.toISOString());
    const data = await fetchJson(dataURL);
    return data;
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
