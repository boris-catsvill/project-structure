import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  constructor({
    label = '',
    link = '',
    formatHeading = data => data,
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    }
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.linkTemplate = link ? `<a href="${link}" class="column-chart__link">View all</a>` : '';
    this.formatHeading = formatHeading;
    this.render();
    this.update(this.range.from, this.range.to);
  }

  getTemplate () {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        ${this.linkTemplate}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.formatHeading}</div>
        <div data-element="body" class="column-chart__chart">`;
  }

  render() {
    const element = document.createElement('div'); // (*)
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.getSubElements(this.element);
  }

  getSubElements(element) {
    const arr = element.querySelectorAll('[data-element]');
    for (const elem of arr) {
      this.subElements[elem.dataset.element] = elem;
    }
  }

  getColumnBody() {
    const maxValue = Math.max(...Object.values(this.data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(this.data)
      .map(([item, value]) => {
      const scale = this.chartHeight / maxValue;
      const percent = (value / maxValue * 100).toFixed(0);

      return `<div style="--value: ${Math.floor(value * scale)}" 
              data-tooltip="<div><small>${new Date(item).toLocaleString("default", {dateStyle: "medium"})}</small></div><strong>${percent}%</strong>"></div>`;
    })
      .join('');
  }
  async loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());
    return await fetchJson(this.url);
  }

  async update(from, to) {
    const data = await this.loadData(from, to);
    this.data = data;
    if (!Object.values(data)) {
      this.element.classList.add('column-chart_loading');
      return data;
    }
    this.element.classList.remove('column-chart_loading');
    const headerTotal = Object.values(data).reduce((a, b) => a + b, 0);
    this.subElements.body.innerHTML = this.getColumnBody();
    this.subElements.header.textContent = this.formatHeading(headerTotal);
    return data;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
