import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({
                url = "",
                range = {
                  from: new Date(),
                  to: new Date(),
                },
                label = "",
                link = "",
                formatHeading = (data) => data,
              } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.data = [];
    this.value = 0;

    this.render();
  }

  async getData(from, to) {
    const url = `${BACKEND_URL}/${this.url}`;
    this.data = await fetchJson(
      `${url}?from=${from.toISOString()}&to=${to.toISOString()}`
    );
    this.value = this.getValues(this.data);

    this.subElements.body.innerHTML = this.getBody(this.data);
    this.subElements.header.innerHTML = this.getHeader(this.value);
    this.element.classList.remove("column-chart_loading");
  }

  getValues(data) {
    return Object.values(data).reduce((a, b) => a + b, 0);
  }

  render() {
    const element = document.createElement("div");
    const link = this.link
      ? `<a href="${this.link}" class="column-chart__link">View all</a>`
      : "";

    element.innerHTML = `
      <div class="column-chart column-chart_loading" style="--chart-height: ${
      this.chartHeight
    }">
        <div class="column-chart__title">
          Total ${this.label}
          ${link}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.getHeader(this.value)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getBody(this.data)}
          </div>
        </div>
      </div>
    `;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.update();
  }

  getHeader(value) {
    return this.formatHeading(value);
  }

  getBody(data) {
    const dataValues = Object.values(data);
    const maxValue = Math.max(...dataValues);
    const scale = this.chartHeight / maxValue;

    return dataValues
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0) + "%";
        const value = String(Math.floor(item * scale));
        return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
      })
      .join("");
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (let subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  async update(from = this.range.from, to = this.range.to) {
    await this.getData(from, to);
    return this.data;
  }

  remove() {
    if(this.element){
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
