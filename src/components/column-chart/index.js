import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element = null;
  subElements = {};
  chartHeight = 50;

  constructor({
                url = '',
                range = {
                  from: new Date(),
                  to: new Date(),
                },
                label = '',
                link = '',
                formatHeading = data => data
              } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    this._renderElement();
    this.subElements = this._getSubElements(this.element);
  }

  async update(from, to) {
    this._setLoadingInd();
    const data = await this._loadData(from, to);
    this._renderChart(data);
    this.setNewRange(from, to);
    this._removeLoadingInd();

    return data;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  async _loadData(from, to) {
    const url = new URL(this.url, BACKEND_URL);

    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());

    return await fetchJson(url.href);
  }

  _getSubElements(parentElement) {
    const elements = parentElement.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, element) => {
      accum[element.dataset.element] = element;

      return accum;
    }, {});
  }

  _setLoadingInd() {
    this.element.classList.add('column-chart_loading');
  }

  _removeLoadingInd() {
    this.element.classList.remove('column-chart_loading');
  }

  getLink() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  _renderElement() {
    const element = document.createElement('div'); // (*)

    element.innerHTML = `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>
    </div>
    `;

    this.element = element.firstElementChild;
  }

  _renderChart(data = {}) {
    const header = this.subElements.header;
    const columnChart = this.subElements.body;
    const dataValues = Object.values(data);

    if (dataValues.length === 0) {
      columnChart.innerHTML = '';
      header.innerHTML = this.formatHeading(0);

      return;
    }

    const dataProps = this._getColumnProps(dataValues);

    header.innerHTML = this.formatHeading(dataValues.reduce((sum, dataValue) => sum + dataValue));

    columnChart.innerHTML = dataProps.map(dataProp => {
      return `<div style="--value: ${dataProp.value}" data-tooltip="${dataProp.percent}"></div>`;
    }).join('');
  }

  setNewRange(from, to) {
    this.from = from;
    this.to = to;
  }

  _getColumnProps(data) {
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
