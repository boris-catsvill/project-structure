export class ColumnChart {
  element;
  chartHeight = 50;
  data = [];

  constructor({ data = [], label = '', link = '', formatHeading = data => data } = {}) {
    this.label = label;
    this.link = link;
    this.data = data;
    this.formatHeading = formatHeading;
    this.render();
  }

  set isLoading(loading) {
    this.loading = loading;
    if (loading) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
  }

  getChart() {
    return `<div class='column-chart column-chart_loading' style='--chart-height: ${
      this.chartHeight
    }'>
                <div class='column-chart__title'>
                    ${this.label}
                    ${this.getLink()}
                </div>
                <div class='column-chart__container'>
                    <div data-element='header' class='column-chart__header'>${this.getHeader()}</div>
                    <div data-element='body' class='column-chart__chart'>${this.getBody()}</div>
                </div>
            </div>`;
  }

  getLink() {
    return this.link ? `<a href='${this.link}' class='column-chart__link'>View all</a>` : ``;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      acc[el.dataset.element] = el;
      return acc;
    }, {});
  }

  update(data = []) {
    this.data = data;
    this.subElements.header.innerHTML = this.getHeader();
    this.subElements.body.innerHTML = this.getBody();
    this.isLoading = false;
  }

  getHeader() {
    const value = this.data.reduce((acc, val) => acc + val, 0);
    return this.formatHeading(value);
  }

  getBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        const percent = ((item / maxValue) * 100).toFixed(0) + '%';
        const value = String(Math.floor(item * scale));
        return `<div style='--value: ${value}' data-tooltip='${percent}'></div>`;
      })
      .join('');
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.getChart();
    this.element = wrap.firstElementChild;
    this.subElements = this.getSubElements();
    this.isLoading = false;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}
