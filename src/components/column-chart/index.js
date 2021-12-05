import fetchJson from '../../utils/fetch-json.js';
import getSubElements from '../../utils/getSubElements';

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
    this.url = new URL(url, process.env.BACKEND_URL);
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
    const entries = Object.entries(data);

    const maxValue = Math.max(...values);
    const proportion = this.chartHeight / maxValue;
    const arr = entries.map(([key, value]) => {
      const date = new Date(key);
      const dateString = date.toLocaleDateString('ru-RU', {
        year: 'numeric',
        day: 'numeric',
        month: 'short',
      });
      const currentValue = Math.floor(value * proportion);
      return `<div style="--value: ${currentValue}" data-tooltip="<div><small>${dateString}</small></div><strong>${this.formatHeading(value)}</strong>"></div>`;
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

  initEventListeners() {
    this.subElements.body.addEventListener('mouseover', (e) => {
      this.subElements.body.classList.add('has-hovered');
      e.target.classList.add('is-hovered');
    });

    this.subElements.body.addEventListener('mouseout', (e) => {
      this.subElements.body.classList.remove('has-hovered');
      e.target.classList.remove('is-hovered');
    });
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = getSubElements(this.element, 'element');

    this.initEventListeners();
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
