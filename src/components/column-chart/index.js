import fetchJson from '../../utils/fetch-json.js';

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};
  hoveredChartColumn = null;

  onPointerOver = (event) => {
    const chartColumn = event.target.closest('[data-tooltip]');
    if(!chartColumn) return;

    chartColumn.classList.add('is-hovered');
    this.hoveredChartColumn = chartColumn;
    this.subElements.body.classList.add('has-hovered');
  }

  onPointerOut = (event) => {
    if(this.hoveredChartColumn) this.hoveredChartColumn.classList.remove('is-hovered');
    this.subElements.body.classList.remove('has-hovered');
  }

  constructor({url = '', range = {from : new Date(), to : new Date()},
               label = '', link = '', formatHeading = (data) => data} = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
      
    this.render();
  }
      
  getTemplate() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          </div>
          <div data-element="body" class="column-chart__chart">
          </div>
        </div>
      </div>
    `;
  }
      
  getBarElementsAsString(data) {
    const values = this.getNormalizeBarArray(data);

    return values.map(item => `<div style="--value:${item.normalizedValue}" data-tooltip="${this.getTooltipInfo(item)}"></div>`).join('');
  }

  getTooltipInfo(item) {
    const date = new Date(item.date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };

    return `<div><small>${date.toLocaleDateString('ru-RU', options)}</small></div><strong>${item.originalValue}</strong>`;
  }
  
  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getNormalizeBarArray(barArray) {
    const maxValue = Math.max(...Object.values(barArray));
    const scale = this.chartHeight / maxValue;
        
    return Object.entries(barArray).map(([date, value]) => {
      return {
        date: date,
        originalValue: value,
        percent: (value / maxValue * 100).toFixed(0) + '%',
        normalizedValue: String(Math.floor(value * scale))
      };
    });
  }
          
  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.update({from: this.range.from, to: this.range.to});

    this.initEventListeners();

    return this.element;
  }

  async update({from, to} = {}) {
    const query = new URL(this.url);
    query.searchParams.set('from', from);
    query.searchParams.set('to', to);

    try {
      this.element.classList.add("column-chart_loading");
      const response = await fetchJson(query.href);
      this.updateReceivedData(response);
      this.element.classList.remove("column-chart_loading");

      return response;
    } catch (error) {
      throw new Error(`Unable to fetch data from ${query}`);
    }
  }

  updateReceivedData(data) {
    const value = Object.values(data).reduce((acc,val) => acc += val, 0);
    this.subElements.header.innerHTML = this.formatHeading(Number(value).toLocaleString('en-US'));
    this.subElements.body.innerHTML = this.getBarElementsAsString(data);
  }

  initEventListeners(){
    this.subElements.body.addEventListener('pointerover', this.onPointerOver);
    this.subElements.body.addEventListener('pointerout', this.onPointerOut);
  }
      
  remove() {
    if(this.element) {
      this.element.remove();  
    }
  }
      
  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}