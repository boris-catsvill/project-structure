export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  dataValues = [];
  data = [];

  constructor({
    url = "",
    range = { 
      from: new Date(), 
      to: new Date()
    },
    label = "",
    link = "",
    formatHeading = (item) => item,
  } = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  async fetchData() {
    this.url.searchParams.set('from', this.range.from.toISOString());
    this.url.searchParams.set('to', this.range.to.toISOString());

    this.element.classList.add("column-chart_loading");

    try {
      const response = await fetch(this.url.toString());
      const data = await response.json();

      this.dataValues = Object.values(data);
  
      if (this.dataValues.length) {
        this.element.classList.remove("column-chart_loading");
      }

      return data;
      
    } catch (error) {
      console.log(error);
    }
  }

  getHeadingValues() {
    const headingValues = this.dataValues.reduce((a, b) => (a + b), 0);
    return this.formatHeading(headingValues);
  }

  noData() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          <a class="column-chart__link" href="${this.link}">View all</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
            ${this.getHeadingValues()}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnProps()}
          </div>
        </div>
      </div>`;
  }

  getLink() {
    if (this.link) {
      return `
        <a class="column-chart__link" href="${this.link}">View all</a>
      `;
    } else {
      return "";
    }
  }

  getColumnProps() {
    const maxValue = Math.max(...this.dataValues);
    const scale = this.chartHeight / maxValue;

    return this.dataValues
      .map((item) => {
        const percent = ((item / maxValue) * 100).toFixed(0);
        const value = Math.floor(item * scale);
        return `
        <div style="--value: ${value}" data-tooltip="${percent}%"></div>
      `;
      })
      .join("");
  }

  getChartTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.getHeadingValues()}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnProps()}
          </div>
        </div>
      </div>
    `;
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

  async render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getChartTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.data = await this.fetchData();
    this.subElements.body.innerHTML = this.getColumnProps();
    this.subElements.header.innerHTML = this.getHeadingValues();
  }

  async update(dateFrom, dateTo) {
    this.range.from = dateFrom;
    this.range.to = dateTo;
    this.data = await this.fetchData();
    this.subElements.body.innerHTML = this.getColumnProps();
    this.subElements.header.innerHTML = this.getHeadingValues();
    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.element.remove();
  }
}
