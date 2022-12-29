import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {
  constructor({
    url = '',
    range = {},
    label = '',
    link = '',
    data = {},
    formatHeading = data => data,
    value = 0,
  } = {}) {
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.value = formatHeading(value);
    this.data = data;
    this.chartHeight = 50;

    this.range = range;
    this.url = new URL(url, BACKEND_URL);

    this.render();
    this.update();
  }

  getTemplate() {
    return `
              <div class="column-chart" style="--chart-height: ${this.chartHeight}">
                <div data-element="title" class="column-chart__title">
                Total ${this.label}
                </div>
                <div class="column-chart__container">
                  <div data-element="header" class="column-chart__header">${this.value}</div>
                  <div data-element="body" class="column-chart__chart">
                  </div>
                </div>
              </div>
          `;
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.renderLink();

    this.renderData();
  }

  renderLink() {
    if (this.link) {
      const elementLink = document.createElement('a');
      elementLink.href = this.link;
      elementLink.classList.add('column-chart__link');
      elementLink.textContent = 'View all';
      this.subElements.title.append(elementLink);
    }
  }

  renderData() {
    if (Object.keys(this.data).length) {
      const arrayColumnPropsData = this.getColumnProps(Object.entries(this.data).map(item => item[1]));

      const columnDataHTML = arrayColumnPropsData.map(item => {
        return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`;
      }).join('');
      this.element.classList.remove('column-chart_loading');
      this.subElements.body.innerHTML = columnDataHTML;
    } else {
      this.renderNoData();
    }
  }

  renderNoData() {
    this.element.classList.add('column-chart_loading');
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
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  update(from = this.range.from, to = this.range.to) {
    if (from) this.url.searchParams.set('from', from);
    if (to) this.url.searchParams.set('to', to);

    return fetchJson(this.url)
      .then(data => {
        this.data = data;
        this.subElements.header.textContent = this.getHeaderValue(data);
        this.renderData();
        return data;
      })
      .catch(error => console.error('Something went wrong: ' + error));
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }
}
