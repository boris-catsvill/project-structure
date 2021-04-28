import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {
  constructor({
    url = '',
    range: {
      from,
      to
    } = {
      from: new Date(),
      to: new Date(),
    },
    label = '',
    link = '',
    value = 0,
    formatHeading = '',
  } = {}) {
    this.url = url;
    this.formatHeading = formatHeading;
    this.fromRange = from;
    this.toRange = to;
    this.value = value;
    this.label = label;
    this.link = link;
    this.chartHeight = 50;

    this.render();
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale)),
      };
    });
  }

  getColumnChartLink() {
    return this.link !== '' ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getColumn(value, percent) {
    return `
            <div style="--value: ${value}" data-tooltip="${percent}"></div>
        `;
  }

  getBody(data = []) {
    const columnProps = this.getColumnProps(data);

    const bodyData = columnProps.map(({ value, percent }) => {
      this.value += +value;

      return this.getColumn(value, percent);
    });

    return bodyData.join('');
  }

  updataColumnChart(data) {
    this.subElements.body.innerHTML = this.getBody(data);

    this.subElements.header.innerHTML = this.formatHeading ? this.formatHeading(this.value) : this.value;

    this.element.classList.remove("column-chart_loading");
  }

  emptyColumnChartBody() {
    const columnChartContainer = this.element.querySelector('.column-chart__container');

    this.element.classList.add("column-chart_loading");

    const emptyChartStyle = getComputedStyle(columnChartContainer, ':before');

    columnChartContainer.style = emptyChartStyle;
  }

  getColumnChart() {
    return `
            <div class="column-chart" style="--chart-height: ${this.chartHeight}">
                <div class="column-chart__title">
                    Total ${this.label}
                    ${this.getColumnChartLink()}
                </div>
                <div class="column-chart__container">
                    <div data-element="header" class="column-chart__header">
                        ${this.formatHeading ? this.formatHeading(this.value) : this.value}
                    </div>
                    <div data-element="body" class="column-chart__chart">
                    </div>
                </div>
            </div>
        `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getColumnChart();

    const element = wrapper.firstElementChild;

    this.element = element;

    this.emptyColumnChartBody();

    this.subElements = this.getSubElements(element);

    this.loadData(this.fromRange, this.toRange);
  }

  async update(from, to) {
    await this.loadData(from, to);
  }

  async loadData(from, to) {
    const urlParams = {
      from: typeof from !== 'string' ? from.toISOString() : from,
      to: typeof to !== 'string' ? to.toISOString() : to,
    };

    const url = new URL(`${BACKEND_URL}${this.url}/`);

    url.searchParams.set('from', urlParams.from);
    url.searchParams.set('to', urlParams.to);

    const response = await fetchJson(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.updataColumnChart(Object.values(response));
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  destroy() {
    this.element.remove();
    this.subElements = {};
  }
}
