import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  /** Заданная высота ColumnChart */
  chartHeight = 50;
  /** Элемент ColumnChart на странице */
  element;
  /** Элементы, отображаемые в ColumnChart - "Столбцы" */
  subElements = {};

  constructor({
    label = '',
    link = '',
    formatHeading = data => data,
    url = '',
    range = {
      from: new Date(),
      to: new Date(),
    }
  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getColumnChartHtml;
    //получаем элемент columnChart
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.update(this.range.from, this.range.to);
  }

  /**
   * Формирует ColumnChart в формате html
   * @returns {string}
   */
  get getColumnChartHtml() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>`;
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  /**
   * Обновление данных элементов без перезагрузки всего ColumnChart
   * @returns {*} обновленные элементы с отображаемыми данными для ColumnChart
   */
  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((childElements, nextFindElement) => {
      childElements[nextFindElement.dataset.element] = nextFindElement;
      return childElements;
    }, {});
  }

  async loadData(from, to) {
    this.range.from = from;
    this.range.to = to;

    //add skeleton
    this.element.classList.add('column-chart_loading');
    this.subElements.header.textContent = '';
    this.subElements.body.innerHTML = '';

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumnBody(data);
      //remove skeleton
      this.element.classList.remove('column-chart_loading');
    }
  }

  /**
   * Обновляет данные в ColumnChart на основании данных, загруженных с сервера
   * @param from начальное значение диапазона времени отображения данных
   * @param to конечное значение диапазона времени отображения данных
   */
  async update(from, to) {
    this.range.from = from;
    this.range.to = to;
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const responseJson = await fetchJson(this.url);
    this.data = Object.values(responseJson);
    this.subElements.header.textContent = this.formatHeading(this.data.reduce((sum, nextPrice) => (sum + nextPrice), 0));
    this.subElements.body.innerHTML = this.getColumns();
    this.element.classList.remove('column-chart_loading');

    return responseJson;
  }

  /**
   * Получение данных в виде процентного соотношения
   * @returns {string} возвращает строку, представляющую совокупность конкатенированных элементов верстки - колонки,
   * размер которых выражен в процентах и зависит от размера элемента columnChart
   */
  getColumns() {
    const maxValue = Math.max(...this.data);
    //вычисление размера шкалы отображения колонок с учетом высоты ColumnChart
    const scaleSize = this.chartHeight / maxValue;

    return this.data.map(element => {
      const percent = (element / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(element * scaleSize)}" data-tooltip="${percent}%"></div>`;
    }).join('');
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
