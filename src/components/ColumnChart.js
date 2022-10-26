export default class ColumnChart {

  chartHeight = 50;
  data = []
  scale = 1
  totalValueOfData = 0

  statusOfLoading = 'fulfilled'
  subElements = {}

  constructor({
    url,
    label,
    range,
    link = '#',
    formatHeading = item => `${item}`,
  }) {

    this.formatHeading = formatHeading;
    this.range = { from: range.from, to: range.to };

    this.url = new URL(url);
    this.urlSetSearchParams();

    this.label = label;
    this.linkOfTitle = `<a class="column-chart__link" href="${link}">Подробнее</a>`;

  }

  urlSetSearchParams() {
    this.url.searchParams.set('from', this.range.from);
    this.url.searchParams.set('to', this.range.to);
  }

  get elementDOM() {
    const element = document.createElement('div');
    const bodyOfElement = (
      `<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
                      <div class="column-chart__title">
                          ${this.label}
                          ${this.linkOfTitle}
                      </div>
                      <div class="column-chart__container">
                          <div data-element="header" class="column-chart__header"></div>
                          <div data-element="body" class="column-chart__chart"></div>
                      </div>
                  </div>`
    );
    element.innerHTML = bodyOfElement;
    return element.firstElementChild;
  }
  
  getScale() {
    return this.data.length > 0 ? (this.chartHeight / Math.max(...this.data)) : 1;
  }

  getTotalValueOfData() {
    const totalValueOfData = this.data.reduce((acc, num) => {
      acc += num;
      return acc;
    }, 0);
    return this.formatHeading(totalValueOfData);
  }

  updateProperties() {
    this.scale = this.getScale();
    this.totalValueOfData = this.getTotalValueOfData();
  }

  createChart(currentValue) {
    const currentValueByScale = Math.floor(this.scale * currentValue);
    return `<div style="--value: ${currentValueByScale}" data-tooltip="${currentValue}"></div>`;
  }

  getColumnChartBody() {
    return this.data.map((currentValue) => this.createChart(currentValue)).join('');
  }

  updateElement() {
    const { header, body } = this.subElements;
    header.textContent = this.getTotalValueOfData();
    body.innerHTML = this.getColumnChartBody();
  }

  switchStatusOfLoading() {
    const switcherStatusOfLoading = {
      pending: () => {
        this.element.classList.remove('column-chart_loading');
        this.statusOfLoading = 'fulfilled';
      },
      fulfilled: () => {
        this.element.classList.add('column-chart_loading');
        this.statusOfLoading = 'pending';
      },
    };
    switcherStatusOfLoading[this.statusOfLoading]();
  }

  async updateData() {
    try {
      this.switchStatusOfLoading();
      this.urlSetSearchParams();

      const response = await fetch(this.url);
      const data = await response.json();
      this.data = Object.values(data);

      this.updateProperties();
      this.switchStatusOfLoading();

    } catch (error) {
      throw new Error(error.message);
    }
  }

  async update() {

    await this.updateData();
    this.updateElement();

  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  render() {
    this.element = this.elementDOM;
    this.setSubElements();
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
  }
}


