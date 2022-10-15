import fetchJson from '../../utils/fetch-json.js';

export default class ColumnChart {
  element;
  subElements = {};
  
  chartHeight = 50;
  language = 'ru-RU';

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '',
    formatHeading = data => data,
  } = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.data = [];

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const columnChart = document.createElement('div');

    columnChart.className = 'column-chart column-chart_loading';

    columnChart.setAttribute('style', `--chart-height: ${this.chartHeight}`);

    columnChart.innerHTML = `
      <div class="column-chart__title">
        ${this.label}
        ${this.getLinkProps()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart"></div>
      </div>
    `

    this.element = columnChart;
    this.subElements = this.getSubElements();
  }

  getLinkProps() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">Подробнее</a>` : '';
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

  getHeaderProps(data) {
    const headerValue = Object.values(data).reduce((sum, value) => sum += value, 0);
    const formatHeaderValue = new Intl.NumberFormat(this.language).format(headerValue);
    
    return this.formatHeading(formatHeaderValue);
  }

  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(data).map(([date, value]) => {
      const currentValue = String(Math.floor(value * scale));

      return `<div style="--value: ${currentValue}" data-tooltip="${this.getTooltipHTML(date, value)}"></div>`;
    }).join('');
  }

  getTooltipHTML(date, value) {    
    const tooltipDate = new Date(date).toLocaleString('ru', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    const tooltipValue = new Intl.NumberFormat(this.language).format(value);

    return `
      <div>
        <small>${tooltipDate}</small>
      </div>
      <strong>${this.formatHeading(tooltipValue)}</strong>
    `
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    this.range.from = from;
    this.range.to = to;
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    if (Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderProps(data);
      this.subElements.body.innerHTML = this.getColumnProps(data);

      this.element.classList.remove('column-chart_loading');
    }

    this.data = data;
    return this.data;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
