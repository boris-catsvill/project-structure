import fetchJson from "../../utils/fetch-json.js";

const BACKEND_URL = process.env.BACKEND_URL;

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
    this.initEventListeners();
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
    const dataProps = this._getColumnProps(data);

    if (dataProps.length === 0) {
      columnChart.innerHTML = '';
      header.innerHTML = this.formatHeading(0);

      return;
    }

    header.innerHTML = this.formatHeading(Object.values(data).reduce((sum, value) => sum + value));

    const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };

    columnChart.innerHTML = dataProps.map(item => {
      const date = new Date(item.date);
      const itemDate = date.toLocaleDateString('ru', dateOptions);

      return `<div style="--value: ${item.relativeValue}"
                   data-tooltip="<div>
                                   <small>${itemDate}</small>
                                 </div>
                                 <strong>${this.formatHeading(item.value)}</strong>">
              </div>`
    }).join('');
  }

  setNewRange(from, to) {
    this.from = from;
    this.to = to;
  }

  initEventListeners() {
    this.subElements.body.addEventListener('mouseover', event => {
      if (event.target.hasAttribute('data-tooltip') ) {
        event.currentTarget.classList.add('has-hovered');
        event.target.classList.add('is-hovered');
      }
    });

    this.subElements.body.addEventListener('mouseout', event => {
      if (event.target.hasAttribute('data-tooltip') ) {
        event.currentTarget.classList.remove('has-hovered');
        event.target.classList.remove('is-hovered');
      }
    });
  }

  _getColumnProps(data) {
    const dataValues = Object.values(data);
    const maxValue = Math.max(...dataValues);
    const scale = this.chartHeight / maxValue;

    return Object.entries(data).map(([date, value]) => {
      return {
        date,
        value,
        relativeValue: String(Math.floor(value * scale)),
      };
    });
  }
}
