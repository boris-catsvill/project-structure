import fetchJson from '../../utils/fetch-json.js';
import BasicComponent from '../basic-component';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart extends BasicComponent {
  chartHeight = 50;
  data = [];

  constructor(
    {
      url = '',
      label = '',
      range = {},
      value = 0,
      link = '',
      formatHeading = (val) => val
    } = {}
  ) {
    super();
    this.url = new URL(url, BACKEND_URL);
    this.label = label;
    this.range = range;
    this.value = value;
    this.link = link;
    this.headingFormatter = formatHeading;
  }

  /**
   * Задаёт диапазон дат и обновляет данные
   * @param {Date} from
   * @param {Date} to
   * @return {Promise<?>} Данные от сервера
   */
  async setRange(from, to) {
    this.range = { from, to };
    return await this.fetchData();
  }

  /**
   * Запрашивает данные с сервера
   * @return {Promise<Object>}
   */
  async fetchData() {
    this.data = [];
    this.update(); // Для перевода в loading state

    if (this.range) {
      const { from, to } = this.range;
      this.url.searchParams.set('from', from.toISOString());
      this.url.searchParams.set('to', to.toISOString());
    } else {
      this.url.searchParams.delete('from');
      this.url.searchParams.delete('to');
    }

    const json = await fetchJson(this.url);

    this.data = Object.values(json);
    this.value = this.data.reduce((prev, val) => prev + val, 0);
    this.update();

    return json;
  }

  getTemplate() {
    const linkTemplate = this.link ? `<a href='${this.link}' class='column-chart__link'>Подробнее</a>` : '';

    return `<div class='column-chart__title'>
        ${this.label} ${linkTemplate}
      </div>
      <div class='column-chart__container'>
        <div data-element='header' class='column-chart__header'><!-- {value} --></div>
        <div data-element='body' class='column-chart__chart'><!-- {charts} --></div>
      </div>`;
  }

  getChartsTemplate() {
    return this.getColumnProps(this.data)
      .map(item => `<div style='--value: ${item.value}' data-tooltip='${item.percent}'></div>`)
      .join('\n');
  }

  update() {
    this.element.style.setProperty('--chart-height', this.chartHeight.toString());
    this.element.className = BasicComponent.filterClassList({
      'column-chart': true,
      'column-chart_loading': !this.data?.length
    }).join(' ');
    this.subElements.header.textContent = this.headingFormatter(this.value);
    this.subElements.body.innerHTML = this.getChartsTemplate();
  }

  async render() {
    this.element.innerHTML = this.getTemplate();
    this.subElements = BasicComponent.findSubElements(this.element);

    // noinspection ES6MissingAwait
    this.fetchData();

    return super.render();
  }

  /**
   * @param {number[]} data
   * @return {Object[]}
   */
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
}
