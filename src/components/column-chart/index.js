import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {
  element = null;
  subElements = {};
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    },
    data = [],
    className = '',
    label = '',
    link = '',
    value = 0,
    formatHeading = data => `${data}`
  } = {}) {
    this.url = url;
    this.range = range;
    this.data = data;
    this.className = className;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading column-chart_${this.className}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.getLink()}
        </div>

        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody(this.data)}
          </div>
        </div>
      </div>
    `;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">Подробнее</a>` : ``;
  }

  getColumnBody(data) {
    const values = data.map(item => item[1]);
    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;

    return data
      .map(item => {
        const percent = (item[1] / maxValue * 100).toFixed(0);
        // console.log(this.getTooltip(item));

        return `<div style="--value: ${Math.floor(item[1] * scale)}" data-tooltip="${this.getTooltip(item)}"></div>`;
      })
      .join('');
  }

  getTooltip([ date = new Date(), value = 0 ] = []) {
    const dataOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    const formatedDate = new Date(date).toLocaleDateString('ru-RU', dataOptions);

    return `<div><small>${formatedDate}</small></div><strong>${this.formatHeading(value)}</strong>`;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async update(startDate, endDate) {
    this.startLoading();

    const url = new URL(this.url, BACKEND_URL);

    url.searchParams.set('from', startDate.toJSON());
    url.searchParams.set('to', endDate.toJSON());

    const response = await fetchJson(url.href);
    
    this.data = Object.entries(response);
    
    this.subElements.body.innerHTML = this.getColumnBody(this.data);
    this.subElements.header.innerHTML = this.setHeader();

    this.finishLoading();
  }

  startLoading() {
    this.element.classList.add('column-chart_loading');
  }

  finishLoading() {
    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
  }

  setHeader() {
    this.value = this.data.reduce((accum, item) => accum + item[1], 0);

    return `${this.formatHeading(this.value)}`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.element) {
      this.remove();
      this.element = null;
    }

    this.subElements = {};
  }
}
