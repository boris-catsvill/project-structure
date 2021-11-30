import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;
  data = [];
  value = 0;

  constructor({
                url = '',
                formatHeading = data => data,
                range = {
                  from: new Date(),
                  to: new Date(),
                },
                label = '',
                link = '',
              } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  getLink() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getColumnBody(data) {
    const values = Object.values(data);

    const maxValue = Math.max(...values);
    const proportion = this.chartHeight / maxValue;
    const arr = values.map((item) => {
      const value = Math.floor(item * proportion);
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${value}" data-tooltip="${percent}%"></div>`;
    });
    return arr.join('');
  }

  getTemplate() {
    return `
      <div class="column-chart column-chart_loading">
        <div class="column-chart__title">
            Total ${this.label}
            ${this.getLink()}
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header">
                ${this.value}
            </div>
            <div data-element="body" class="column-chart__chart">
                ${this.getColumnBody(this.data)}
            </div>
        </div>
      </div>
    `;
  }

  getSubElements(element) {
    const elements = {};

    const subElements = element.querySelectorAll('[data-element]');

    for (const subElement of subElements) {
      elements[subElement.dataset.element] = subElement;
    }

    return elements;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getTotalSum(data) {
    let sum = 0;
    Object.values(data).map((value) => {
      sum += value;
    });
    return sum;
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    this.range.from = from.toISOString();
    this.range.to = to.toISOString();

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    this.data = await fetchJson(this.url);
    if (this.data && Object.values(this.data).length) {
      this.subElements.body.innerHTML = this.getColumnBody(this.data);
      this.subElements.header.innerHTML = this.formatHeading(this.getTotalSum(this.data));

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
  }
}
