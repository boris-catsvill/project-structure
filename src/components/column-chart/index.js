import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  element = null;
  data = [];
  columns = [];
  subElements = {};

  constructor({
    url = '',
    range = {},
    label = '',
    link = '',
    value = 0,
    formatHeading = a => a
  } = {}) {
    this.url = url;
    this.label = label;
    this.link = link;
    this.value = value;
    this.range = range;
    this.formatHeading = formatHeading;

    this.render();
    this.loadData();
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getTemplate();
    this.element = wrap.firstElementChild;
    this.getSubElements();
  }

  getSubElements() {
    for (const item of this.element.querySelectorAll('div[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
  }

  getTemplate() {
    return `<div class="column-chart column-chart_loading"
      style="--chart-height: ${this.chartHeight}">
        ${this.getTitleTemplate()}
        <div class="column-chart__container">
          ${this.getHeaderTemplate()}
          ${this.getBodyTemplate()}
        </div>
      </div>
  `;
  }

  getTitleTemplate() {
    const linkHtml = this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : '';
    return `<div class="column-chart__title">Total ${this.label}${linkHtml}</div>`;
  }

  getHeaderTemplate() {
    const headerBody = this.isDataLoaded() ? this.formatHeading(this.value || '') : '';
    return `<div data-element="header" class="column-chart__header">${headerBody}</div>`;
  }

  getBodyTemplate() {
    return `<div data-element="body" class="column-chart__chart">${this.getChartsTemplate()}</div>`;
  }

  getChartsTemplate() {
    return this.isDataLoaded()
      ? this.columns
          .map(item => `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`)
          .join('')
      : '';
  }

  getColumnProps(data = this.data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  async loadData() {
    this.element.classList.add('column-chart_loading');

    const query = [BACKEND_URL + '/' + this.url + '/?'];
    for (const [k, v] of Object.entries(this.range)) {
      query.push(`${k}=${v}&`);
    }

    const data = await fetchJson(query.join(''));
    this.updateData(data);

    // fetchJson(query.join("")).then((data) => {
    //   this.updateData(data);
    // });

    return data;
  }

  isDataLoaded(data = this.data) {
    return data && this.columns.length > 0;
  }

  async update(from = null, to = null) {
    const isNewRange =
      !this.range?.from ||
      !this.range?.to ||
      this.range.from.getTime() !== from.getTime() ||
      this.range.to.getTime() !== to.getTime();

    if (isNewRange) {
      this.range = { from, to };
      return await this.loadData();
    } else {
      return this.data;
    }
  }

  updateData(data) {
    const loaded = data && Object.values(data);
    if (loaded && loaded.length > 0) {
      this.data = data;
      this.columns = this.getColumnProps(loaded);
      this.value = loaded.reduce((a, v) => ((a += +v), a), 0);

      this.updateVisual();
    }
  }

  updateVisual() {
    if (this.value) {
      this.subElements.header.innerHTML = this.getHeaderTemplate();
      this.subElements.body.innerHTML = this.getChartsTemplate();
      this.element.classList.remove('column-chart_loading');
    } else {
      this.element.classList.add('column-chart_loading');
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
