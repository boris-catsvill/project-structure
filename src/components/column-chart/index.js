
const BACKEND_URL = 'https://course-js.javascript.ru';
const chartHeight = 50;
export default class ColumnChart {
  subElements;

  constructor({
    data = [],
    label = '',
    link = '',
    value = '',
    formatHeading = data => `${data}`,
    url = '',
    range = {
      from: new Date(),
      to: new Date()
    }
  } = {}) {
    this.chartHeight = chartHeight;
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.formatHeading = formatHeading;
    this.render();
  }

  getColumns(data = this.data) {
    data = Object.values(data);
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return this.data.map(item => {
      const value = String(Math.floor(item * scale));
      const percent = (item / maxValue * 100).toFixed(0) + '%';
      const columnProps = `style="--value: ${value}" data-tooltip="${percent}"`;
      return `<div ${columnProps}></div>`;
    }).join('');
  }

  checkDataLength(data = this.data) {
    if (data.length === 0) {
      return `column-chart_loading`;
    } else {
      return '';
    }
  }

  getTemplate() {
    return `<div class="column-chart ${this.checkDataLength()}" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                   ${this.label}
                <a href="${this.link}" class="column-chart__link">View all</a>
               </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
                <div data-element="body" class="column-chart__chart">
                  ${this.getColumns()}
                </div>
              </div>
            </div>`;
  }

  getSubElements() {
    const subElements = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const element of elements) {
      const name = element.dataset.element;
      subElements[name] = element;
    }
    return subElements;
  }

  render() {
    const element = document.createElement("div"); // (*)
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    if (!this.subElements) {
      this.subElements = this.getSubElements();
    }
  }

  update(data) {
    this.data = data.bodyData;
    this.value = data.headerData;
    this.subElements.body.innerHTML = this.getColumns();
    this.subElements.header.textContent = this.value;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
