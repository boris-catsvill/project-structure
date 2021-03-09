export default class ColumnChart {
  subElements = {};

  constructor(props = {}) {
    const {
      data = [],
      label = '',
      link = '',
      chartHeight = 50,
      value = 0,
    } = props;

    this.loadingClass = 'column-chart_loading';

    this.data = data;
    this.label = label;
    this.link = link;
    this.chartHeight = chartHeight;
    this.value = value;

    this.render();
  }

  getHeaderValue(data) {
    return Object.values(data).reduce((accum, item) => (accum + item), 0);
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

  getColumnTemplate(data) {
    return this.getColumnProps(data).map((item) => {
      return `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`
    }).join('')
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    if (this.data && this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements(this.element);

    this.subElements.header.textContent = this.getHeaderValue(this.data);
    this.subElements.body.innerHTML = this.getColumnTemplate(this.data);
  }

  get template() {
    return `
      <div class="column-chart ${this.loadingClass}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}

          ${this.link ? (
            `<a href="${this.link}" class="column-chart__link">View all</a>`
          ) : ``}

        </div>

        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  update ({headerData, bodyData}) {
    this.subElements.header.textContent = headerData;
    this.subElements.body.innerHTML = this.getColumnTemplate(bodyData);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
