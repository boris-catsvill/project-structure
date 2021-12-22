import Component from '../../utils/component';

const BACKEND_URL = `${process.env.BACKEND_URL}`;

const MONTH_NAMES = [
  'янв',
  'фев',
  'март',
  'апр',
  'май',
  'июнь',
  'июль',
  'авг',
  'сент',
  'окт',
  'нояб',
  'дек'
]

export default class ColumnChart extends Component {
  constructor(
    {
      data = [], 
      url = '', 
      label = '', 
      formatHeading = (it) => it, 
      link = '', 
      range = {
        from: new Date(),
        to: new Date(),
      },
      value = 0
    } = {}
  ) {
    super();

    this.data = data;
    this.value = value;
    this.label = label;


    this.url = new URL(url, BACKEND_URL);
    this.range = range;


    this.link = link;
    this.formatHeading = formatHeading;

    this.maxHeight = 50;
  }


  initEventListeners() {
    this.getChildElementByName('body').addEventListener('pointermove', this.handleHoverChart);
  }

  removeEventListeners() {
    this.getChildElementByName('body').removeEventListener('pointermove', this.handleHoverChart);
  }

  handlePointerMove = () => {
    this.currentChart.classList.add('is-hovered');
    this.subElements.body.classList.add('has-hovered')
  }

  handlePointerLeave = () => {
    this.currentChart.classList.remove('is-hovered');
    this.subElements.body.classList.remove('has-hovered');

    this.currentChart.removeEventListener('pointermove', this.handlePointerMove);
    this.currentChart.removeEventListener('pointerleave', this.handlePointerLeave);
    this.currentChart = null;
  }

  handleHoverChart = ({ target }) => {
    const el = target.closest('[data-tooltip]');

    if(el) {
      this.currentChart = el;
      this.currentChart.addEventListener('pointermove', this.handlePointerMove);
      this.currentChart.addEventListener('pointerleave', this.handlePointerLeave);
    }
  }

  async handleLoadData(from, to) {
    this.url.searchParams.set('to', new Date(to).toISOString());
    this.url.searchParams.set('from', new Date(from).toISOString());

    const data = await this.fetchJson(this.url);

    return Object.values(data).length 
      ? data
      : {};
  }

  get chartHeight() {
    return this.maxHeight;
  }

  get template() { 
    return (
      `<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
          <div class="column-chart__title">
            ${this.getLabel()}
            ${this.getLink()}
          </div>
          <div class="column-chart__container">
            <div data-element="header" class="column-chart__header"></div>
              <div data-element="body" class="column-chart__chart"></div>
          </div>
      </div>`
    );
  }

  async render() {
    const { from, to } = this.range;
    
    const data = await this.handleLoadData(from, to);
    this.data = data;
    
    
    if (data) {
      this.refToElement.classList.remove('column-chart_loading');
      this.getChildElementByName('body').innerHTML = this.getColumnChart(data);
      this.getChildElementByName('header').innerHTML = this.getHeader(data);
    }
  }

  async update(from, to) {
    const data = await this.handleLoadData(from, to);
    this.range = { from, to };
    this.getChildElementByName('body').innerHTML = this.getColumnChart(data);
    this.getChildElementByName('header').innerHTML = this.getHeader(data);

    this.data = data;
    return data;
  }

  static formatDate(date) {
    const dateInstance = new Date(date);
    const day = dateInstance.getDate();
    const monht = dateInstance.getMonth();
    const year = dateInstance.getFullYear();

    return `${day} ${MONTH_NAMES[monht]}. ${year} г.`
  }

  getColumnChart(data) {
    const viewData = this.getDataFromView(data);
    const max = Math.max(...viewData.map(({value}) => value));
    const scale = this.chartHeight / max;

    const getTooltipData = ({ key, value }) => {
      return `<div><small>${ColumnChart.formatDate(key)}</small></div><strong>${this.formatHeading(value)}</strong>`
    }

    return viewData
      .map(
        ({ key, value }) => (`<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${getTooltipData({ key, value })}"></div>`)
      )
      .join('');
  }

  getLink() {
    return this.link ? `<a href="/${this.link}" class="column-chart__link">Подробнее</a>` : '';
  }

  getHeader(data) {
    const max = this.getDataFromView(data).reduce((acc, { value }) => acc + value, 0);
  
    return this.formatHeading(max);
  }

  getLabel() {
    return this.label ? this.label : '';
  }

  getDataFromView(data) {
    return Object.values(data).length 
      ? Object.entries(data).map(([key, value]) => ({ key, value }))
      : [];
  }
}
