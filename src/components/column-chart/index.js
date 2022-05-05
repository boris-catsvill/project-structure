import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  constructor(
    { url = ''
      , range = {from: new Date(), to: new Date() - 1}
      , label = ''
      , value = 0
      , link = null
      , formatHeading = (value) => value
      , chartHeight = 50
    } = {}) {
    this.formatHeading = formatHeading;
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.data = [];
    this.label = label;
    this.value = this.formatHeading(value);
    this.link = link;
    this.chartHeight = chartHeight;

    this.render();
    this.update();
  }

  getTemplate() {
    return `
          <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
              Total ${ this.label }
              ${ this.getLink() }
            </div>
            <div class="column-chart__container">
               <div data-element="header" class="column-chart__header">
                 ${ this.value }
               </div>
              <div data-element="body" class="column-chart__chart">
                ${ this.getColumnBody() }
              </div>
            </div>
      </div>
    `;
  }

  render() {
    const chart = document.createElement('div');

    chart.innerHTML = this.getTemplate();

    this.element = chart.firstElementChild;

    this.subElements = {
      'header' : this.element.querySelector('[data-element="header"]'),
      'body' : this.element.querySelector('[data-element="body"]'),
    }
  }

  renderChart(dataObj) {
    this.data = Object.values(dataObj);
    this.value = this.formatHeading(this.data.reduce((sum, cur) => sum + cur, 0));

    this.subElements.header.innerHTML = this.value;
    this.subElements.body.innerHTML = this.getColumnBody();

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }
  }

  getColumnBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map((item) => {
      return `<div style="--value: ${String(Math.floor(item * scale))}"
               data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>`;
    }).join('');
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  async update(newRange = this.range) {

    this.range.from = newRange.from;
    this.range.to = newRange.to;

    this.url.searchParams.set('from', this.range.from);
    this.url.searchParams.set('to', this.range.to);

    this.element.classList.add("column-chart_loading");

    let json;

    try {
      json = await fetchJson(this.url);
    } catch (error) {
      this.element.dispatchEvent(new CustomEvent('network-error', {
        bubbles: true,
        detail: error.message
      }));
    }

    this.renderChart(json);

    this.element.classList.remove("column-chart_loading");

    return json;
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
