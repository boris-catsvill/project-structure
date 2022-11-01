export default class ColumnChart {
  static BACKEND_URL = process.env.BACKEND_URL;

  chartHeight = 50;
  subElements = {};
  element;

  constructor({
                data = [],
                value = 0,
                label = '',
                formatHeading = data => data,
                link = '',
                url = '',
                range = {from: '', to: ''},
              } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.formatHeading = formatHeading;
    this.link = link;
    this.url = new URL(url, ColumnChart.BACKEND_URL);
    this.to = range.to;
    this.from = range.from;
    this.render();
    this.update();
  }

  getColumnProps(num) {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    const percent = (num / maxValue * 100).toFixed(0) + '%';
    const value = String(Math.floor(num * scale));
    return [value, percent];
  }

  async getData() {
    this.url.searchParams.set('from', this.from.toISOString());
    this.url.searchParams.set('to', this.to.toISOString());

    try {
      const response = await fetch(this.url);
      if (response.ok) {
        const responseObj = await response.json();
        this.data = Object.values(responseObj);
        this.value = this.formatHeading(Object.values(this.data).reduce((acc, curr) => acc += curr, 0));
        return responseObj;
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  getDataList(data = this.data) {
    return data.map(item => {
      const style = `--value:${this.getColumnProps(item)[0]}`;
      const percent = this.getColumnProps(item)[1];

      return `<div style=${style} data-tooltip=${percent}></div>`;
    }).join('');
  }

  template(data = this.data) {
    return `
        <div class='column-chart' style="--chart-height: ${this.chartHeight}">
            <div class='column-chart__title'>
                ${this.label}
                ${this.link && `<a class="column-chart__link" href=${this.link}>View all</a>`}
            </div>
            <div class='column-chart__container'>
                <div data-element='header' class='column-chart__header'>${this.value}</div>
                <div data-element='body' class='column-chart__chart'>${this.getDataList(data)}</div>
            </div>
        </div>
    `;
  }

  render(data = this.data) {
    const element = document.createElement('div');

    element.innerHTML = this.template(data);

    if (!(this.data.length && this.value)) {
      const columnChart = element.querySelector('.column-chart');

      columnChart.classList.add('column-chart_loading');
    }

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  async update(start = this.from, end = this.to) {
    this.from = start;
    this.to = end;
    const response = await this.getData();

    const chart = this.subElements.body;
    chart.innerHTML = `${this.getDataList(this.data)}`;

    const chartHeader = this.subElements.header;
    chartHeader.innerHTML = `${this.value}`;

    this.element.classList.remove('column-chart_loading');

    return response;
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

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
