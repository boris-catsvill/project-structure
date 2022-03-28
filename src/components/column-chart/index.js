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
    
    this.render();
  }

  getData = async (from, to) => {
    const url = new URL(this.url, process.env.BACKEND_URL);
    url.searchParams.set('from', from);
    url.searchParams.set('to', to);
    return await fetchJson(url);
  };

  getTemplate = () => {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
    <div class="column-chart__title">
      ${this.label}
      ${this.getLink()}
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
  };

  calcValuesArray = (data, chartHeight) => {
    const maxValue = Math.max(...data);
    const scale = chartHeight / maxValue;
    return data.map(item => {
      return {
        value: Math.floor(item * scale),
        percents: Math.round(item / maxValue * 100)
      };
    });
  };

  createChartItem = (data, height) => {
    const dataNubmer = Object.values(data);
    const date = Object.keys(data)
    .map(item => new Date(item)
    .toLocaleString('ru-RU', {dateStyle: 'medium'}));

    return this.calcValuesArray(dataNubmer, height).map(({value}, index) => {
      return `<div style="--value: ${value}"
        data-tooltip="<div><small>${date[index]}</small></div><strong>${value}</strong>">
      </div>`;
    }).join('');
  };

  getLink = () => {
    return this.link ? `<a class="column-chart__link" href = ${this.link}>Подробнее</a>` : '';
  };

  render = async () => {
    const $wrapper = document.createElement('div');
    $wrapper.insertAdjacentHTML('beforeend', this.getTemplate());
      
    this.element = $wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    const {from, to} = this.range;

    const data = await this.getData(from, to);

    if (Object.values(data).length) {
      this.element.classList.remove('column-chart_loading');
    } 
    
    this.subElements.body.insertAdjacentHTML('beforeend', this.createChartItem(data, this.chartHeight));
    this.value = new Intl.NumberFormat('en-US').format(Object.values(data).reduce((acc, item) => acc += item, 0));
    this.subElements.header.innerHTML = this.formatHeading(this.value);

    this.initEventListeners();
  };

  getSubElements = () => {
    const result = {};
    const $els = this.element.querySelectorAll('[data-element]');
    $els.forEach(item => {
      const name = item.dataset.element;
      result[name] = item;
    });
    return result;
  };

  initEventListeners = () => {
    document.addEventListener('tooltip-move', this.tooltipMoveHandler);
    document.addEventListener('tooltip-out', this.tooltipOutHandler);
  };

  tooltipMoveHandler = event => {
    event.detail.parentElement.classList.add('has-hovered');
    event.detail.classList.add('is-hovered');
  };

  tooltipOutHandler = event => {
    event.detail.parentElement.classList.remove('has-hovered');
    event.detail.classList.remove('is-hovered');
  };

  removeEventListeners = () => {
    document.removeEventListener('tooltip-move', this.tooltipMoveHandler);
    document.removeEventListener('tooltip-out', this.tooltipOutHandler);
  };

  update = async (from, to) => {
    const data = await this.getData(from, to);
    this.subElements.body.innerHTML = this.createChartItem(data, this.chartHeight);
    this.value = new Intl.NumberFormat('en-US').format(Object.values(data).reduce((acc, item) => acc += item, 0));
    this.subElements.header.innerHTML = this.formatHeading(this.value);

    return data;
  };

  destroy = () => {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.removeEventListeners();
  };

  remove = () => {
    if (this.element) {
      this.element.remove();
    }
  };

}
