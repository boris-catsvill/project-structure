import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

const dateNow = new Date();

export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(dateNow.setMonth(dateNow.getMonth() - 1)),
      to: new Date()
    },
    label = '',
    link = '',
    formatHeading = value => value
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  renderLink() {
    if (!this.link) return '';
    return `<a href="${this.link}" class="column-chart__link">View all</a>`;
  }

  renderData() {
    const valuesData = Object.values(this.data);
    const maxValue = Math.max(...valuesData);
    const scale = this.chartHeight / maxValue;
    const showDate = new Date(this.range.from);
    showDate.setDate(showDate.getDate() - 1);

    return valuesData
      .map(item => {
        showDate.setDate(showDate.getDate() + 1);
        return `<div style="--value: ${Math.floor(item * scale).toFixed(
          0
        )}" data-tooltip="${showDate.toLocaleString('ru', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        })}<br/><b>${item.toFixed(0)}</b>"></div>`;
      })
      .join('');
  }

  renderHTMLCode() {
    return `
    <div
      class="column-chart"
      style="--chart-height: ${this.chartHeight}"
    >
      <div
        class="column-chart__title"
        data-element="title"
      >
        Total ${this.label}
        ${this.renderLink()}
      </div>
      <div
        class="column-chart__container"
        data-element="container"
      >
        <div
          class="column-chart__header"
          data-element="header"
        >
        </div>
        <div
          class="column-chart__chart"
          data-element="body"
        >
        </div>
      </div>
    </div>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.renderHTMLCode();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();

    this.update();
  }

  async getDataFromServer(dateFrom = '', dateTo = '') {
    try {
      this.data = await fetchJson(this.url + `?from=${dateFrom}&to=${dateTo}`);
    } catch (e) {
      throw new Error(e);
    }
  }

  async update(dateFrom = this.range.from, dateTo = this.range.to) {
    const { header, body } = this.subElements;

    this.range.from = dateFrom;
    this.range.to = dateTo;

    this.element.classList.add('column-chart_loading');

    await this.getDataFromServer(dateFrom, dateTo);

    this.value = Object.values(this.data).reduce(
      (prevValue, currentValue) => prevValue + currentValue,
      0
    );
    header.innerHTML = this.formatHeading(this.value);
    body.innerHTML = this.renderData();
    this.element.classList.remove('column-chart_loading');

    return this.data;
  }

  initEventListeners() {
    this.subElements.container.addEventListener('mouseover', event => {
      const target = event.target.closest('[data-tooltip]');
      if (target) {
        target.classList.add('is-hovered');
        this.subElements.body.classList.add('has-hovered');
      }
    });
    this.subElements.container.addEventListener('mouseout', event => {
      const target = event.target.closest('[data-tooltip]');
      if (target) {
        target.classList.remove('is-hovered');
        this.subElements.body.classList.remove('has-hovered');
      }
    });
  }

  getSubElements(parent = this.element) {
    const result = {};
    const elementsDOM = parent.querySelectorAll('[data-element]');

    for (const subElement of elementsDOM) {
      result[subElement.dataset.element] = subElement;
    }

    return result;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
  }
}
