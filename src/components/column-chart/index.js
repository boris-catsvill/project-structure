import Notification from '../notification/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import { NOTIFICATION_TYPE, BACKEND_URL, LOCALE } from '../../constants/index.js';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  onMouseOver = event => {
    const element = event.target.closest('.column-chart__chart');
    if (!element) {
      return;
    }
    element.classList.add('has-hovered');
    event.target.classList.add('is-hovered');
  }

  onMouseOut = event => {
    const element = event.target.closest('.column-chart__chart');
    if (!element) {
      return;
    }
    element.classList.remove('has-hovered');
    event.target.classList.remove('is-hovered');
  }

  constructor({
                url = '',
                range = {
                  from: new Date(),
                  to: new Date(),
                },
                label = '',
                link = '',
                formatHeading = data => data
              } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render()
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.loadData();

    this.initEventListeners();
  }

  get template() {
    const linkText = this.link ? 'Подробнее' : '';
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          <a class="column-chart__link" href="${this.link}">${linkText}</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  initEventListeners() {
    this.element.addEventListener('mouseover', this.onMouseOver);
    this.element.addEventListener('mouseout', this.onMouseOut);
  }

  getChartColumns() {
    const columnProps = this.getColumnProps(Object.values(this.data));

    return Object.entries(this.data)
      .map(([key, value], index) => this.getChartColumn(key, value, columnProps[index]))
      .join('');
  }

  getChartColumn(key, value, properties) {
    const tooltip = `
      <div>
        <small>${this.formatDate(key)}</small>
      </div>
      <strong>${this.formatHeading(value)}</strong>
    `;

    return `
      <div style="--value: ${properties.value}" data-tooltip="${escapeHtml(tooltip)}"></div>
    `;
  }

  formatDate(data) {
    const options = {year: 'numeric', month: 'short', day: 'numeric'};

    return new Date(data).toLocaleDateString(LOCALE, options);
  }

  getSubElements(element) {
    const result = {};

    for (const subElement of element.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  async loadData() {
    this.url.searchParams.set('from', this.range.from.toISOString());
    this.url.searchParams.set('to', this.range.to.toISOString());

    this.element.classList.add('column-chart_loading');

    this.data = await fetchJson(this.url);
    this.updateChart();

    this.element.classList.remove('column-chart_loading');
  }

  async update(from, to) {
    this.range = {from, to};
    await this.loadData();
  }

  updateChart() {
    const {header, body} = this.subElements;
    header.textContent = this.formatHeading(this.calculateValue());
    body.innerHTML = this.getChartColumns();
  }

  calculateValue() {
    return Object.values(this.data).reduce((previous, current) => previous + current, 0);
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
