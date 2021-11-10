import fetchJson from '~utils/fetch-json.js';

export default class ColumnChart {
  constructor({
    url = '',
    range = {},
    label = '',
    link = '',
    value = 0,
    formatHeading = heading => heading
  } = {}) {
    this.url = url;
    this.range = range;
    this.data = [];
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = 50;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  async update(from, to) {
    const url = new URL(this.url, process.env.BACKEND_URL);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);

    try {
      const data = await fetchJson(url);
      this.data = Object.values(data);
      this.maxValue = Math.max(...this.data);
      this.value = this.data.reduce((acc, val) => acc += val, 0);

      const header = this.getHeader();
      const body = this.getBody();
      this.subElements.header.innerHTML = this.toHTML(header).innerHTML;
      this.subElements.body.innerHTML = this.toHTML(body).innerHTML;
      this.element.classList.remove('column-chart_loading');

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    this.element = this.toHTML(this.builder());
    this.subElements = this.getSubElements(this.element);
  }

  builder() {
    this.link = this.link ? this.createLink(this.link) : '';
    return this.getTemplate();
  }

  getTemplate() {
    return `
    <div class="column-chart ${ !this.data.length ? 'column-chart_loading' : ''}" style="--chart-height: ${this.chartHeight};">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.link}
      </div>
      <div class="column-chart__container">
        ${this.getHeader()}
        ${this.getBody()}
      </div>
    </div>
  `;}

  createLink = (href) => `<a class="column-chart__link" href="${href}">View all</a>`;

  getHeader() {
    return `<div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>`;
  }

  getBody() {
    const chart = this.data.map((item) => {
      return this.createChartItem({
        height: String(Math.floor(item * (this.chartHeight / this.maxValue))),
        value: (item / this.maxValue * 100).toFixed(0) + '%',
      });
    }).join('');
    return `<div data-element="body" class="column-chart__chart">${chart}</div>`;
  }
  createChartItem = ({height, value}) => `<div style="--value: ${height}" data-tooltip="${value}"></div>`;

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach((el) => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}
