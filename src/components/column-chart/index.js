import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  chartHeight = 50;
  data = [];
  value = 0;
  constructor({
    url = "",
    range = { from: null, to: null },
    label = "",
    link = "",
    formatHeading = (data) => data,
  } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.transformData();
    this.render();
    this.subElements = this.getSubElements();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
  }

  getTemplate() {
    return `  
    <div class="column-chart column-chart_loading" style="--chart-height: ${
      this.chartHeight
    }">
        <div class="column-chart__title">
            ${this.label}
            <a href="${this.link}" class="column-chart__link" ${
      !this.link ? "hidden" : ""
    }>View all</a>
        </div>
        <div class="column-chart__container">
            <div data-element="header" class="column-chart__header"> ${this.formatHeading(
              this.value
            )} </div>
            <div data-element="body" class="column-chart__chart"> ${this.getChart()} </div>
        </div>
    </div>
    `;
  }

  getChart() {
    return this.data
      .map((item) => {
        return `<div style="--value: ${item.value}" data-tooltip="${item.part}%"></div>`;
      })
      .join("\n");
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

  async update(start = new Date(), end = new Date()) {
    this.element.classList.add("column-chart_loading");

    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.set('from', start.toISOString());
    url.searchParams.set('to',end.toISOString());

    const data = await fetchJson(url); 

    this.data = Object.entries(data);

    this.value = this.data.reduce((sum,item) => sum + item[1],0);
    this.subElements.header.innerHTML = this.formatHeading(this.value);

    this.transformData();

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
      this.subElements.body.innerHTML = this.getChart();
    }
      return data;
  }

  destroy() {
    this.remove();
  }

  remove() {
    this.element.remove();
  }

  transformData() {
    if (typeof this.data === "undefined" || this.data.length === 0) return;

    const maxValue = Math.max(...this.data.map((item) => item[1]));
    const coefTransform = maxValue / this.chartHeight;
    this.data = this.data.map((item) => {
      return {
        date: item[0],
        original: item[1],
        value: Math.trunc(item[1] / coefTransform),
        part: Math.round((item[1] * 100) / maxValue),
      };
    });
  }
}
