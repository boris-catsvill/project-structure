import fetchJson from '../../utils/fetch-json';

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;
  value = 0;
  constructor(
    {
      url = '',
      range = {},
      label = '',
      link = '',
      value = 0,
      formatHeading = data => data
    } = {}) {
    this.url = url;
    this.range = range;
    this.label = label;
    this.formatHeading = formatHeading;
    this.value = value;
    this.link = link;
    
    this._render();
  }
  _getData = async (from, to) => {
    const url = new URL(this.url, process.env.BACKEND_URL);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    return await fetchJson(url);
  }
  _getTemplate = () => {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
    <div class="column-chart__title">
      ${this.label}
      ${this._getLink()}
    </div>
    <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">
        </div>
        <div data-element="body" class="column-chart__chart">
      </div>
      <div data-element="js"></div>
    </div>
  </div>
    `;
  }
  _calcValuesArray = (data, chartHeight) => {
    const maxValue = Math.max(...data);
    const scale = chartHeight / maxValue;
    return data.map(item => {
      return {
        value: Math.floor(item * scale),
        percents: Math.round(item / maxValue * 100)
      };
    });
  }
  _createChartItem = (data, height) => {
    return this._calcValuesArray(data, height).map(({value, percents}) => {
      return `<div style="--value: ${value}" data-tooltip="${percents}%"></div>`;
    }).join('');
  }
  _getLink = () => {
    return this.link ? `<a class="column-chart__link" href = ${this.link}>Подробнее</a>` : '';
  }
  _render = async () => {
    const $wrapper = document.createElement('div');
    $wrapper.insertAdjacentHTML('beforeend', this._getTemplate());
      
    this.element = $wrapper.firstElementChild;
    this.subElements = this._getSubElements();

    const {from, to} = this.range;

    const data = Object.values(await this._getData(from, to));

    if (data.length) {
      this.element.classList.remove('column-chart_loading');
    } 
    
    this.subElements.body.insertAdjacentHTML('beforeend', this._createChartItem(data, this.chartHeight));
    this.value = new Intl.NumberFormat('en-US').format(data.reduce((acc, item) => acc += item, 0));
    this.subElements.header.innerHTML = this.formatHeading(this.value);
  }
  _getSubElements = () => {
    const result = {};
    const $els = this.element.querySelectorAll('[data-element]');
    $els.forEach(item => {
      const name = item.dataset.element;
      result[name] = item;
    });
    return result;
  }
  update = async (from, to) => {
    const data = await this._getData(from, to);
    this.subElements.body.innerHTML = this._createChartItem(Object.values(data), this.chartHeight);
    this.value = new Intl.NumberFormat('en-US').format(Object.values(data).reduce((acc, item) => acc += item, 0));
    this.subElements.header.innerHTML = this.formatHeading(this.value);

    return data;
  }
  destroy = () => {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
  remove = () => {
    if (this.element) {
      this.element.remove();
    }
  }
}
