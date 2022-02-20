import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = `${process.env.BACKEND_URL}`

export default class ColumnChart {
  chartHeight = 50;

  constructor({
    url = '',
    range = {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date()
    },
    label = '',
    data = [],
    value = 0,
    link = '',
    formatHeading
  } = {}) {

    this.url = url;
    this.range = range;
    this.label = label;
    this._data = data;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range);
    this.initEventListeners()
  }

  set data(newData) {

    const newValues = Object.values(newData);

    if (newValues.length) {
      this.element.classList.remove('column-chart_loading')
    }

    this.value = newValues.reduce((sum, value) => sum + value, 0);

    this.subElements.header.innerHTML = this.getHeading(this.value)
    this.subElements.body.innerHTML = this.getChartColumns(newValues);

    return this._data = newData;
  }

  get data() {
    return this._data;
  }

  formatDate(date) {

    return date.toLocaleString('ru', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  getChartColumns(data) {

    const { from } = this.range
    const maxColHeight = Math.max(...data);

    return data.map((colHeight, index) => {

      const value = Math.floor(this.chartHeight / maxColHeight * colHeight);
      const date = this.formatDate(new Date(from.getFullYear(), from.getMonth(), from.getDate() + index))

      return `<div style="--value: ${value}"
        data-tooltip="<div><small>${date}</small></div><strong>${value}</strong>"></div>`

    }).join('');
  }

  get template() {
    return `
       <div class="column-chart column-chart_loading" style="--chart-height: 50">
      <div class="column-chart__title">
        ${this.label}
        ${this.link ? '<a href="/sales" class="column-chart__link">Подробнее</a>' : ''}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
           ${this.getHeading(this.value)}
        </div>
        <div data-element="body" class="column-chart__chart">
           ${this.getChartColumns(this.data)}
        </div >
      </div >
    </div >
   `
  }

  getHeading(value) {

    return this.formatHeading ? this.formatHeading(value) : value;
  }

  render() {

    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {
      result[item.dataset.element] = item;
      return result;
    }, {})
  }

  update({ from, to }) {

    this.range = {
      from,
      to
    }

    return fetchJson(`${BACKEND_URL}${this.url}?from=${from}&to=${to}`)
      .then((newData) => this.data = newData)
  }

  initEventListeners() {

    this.subElements.body.addEventListener('pointerover', (event) => {

      this.subElements.body.classList.add('has-hovered');
      event.target.classList.add('is-hovered');
      this.subElements.body.classList.remove('is-hovered');

      event.target.addEventListener('pointerout', () => {
        event.target.classList.remove('is-hovered');
      })

    })

    this.subElements.body.addEventListener('pointerout', () => {

      this.subElements.body.classList.remove('has-hovered');

    })
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
