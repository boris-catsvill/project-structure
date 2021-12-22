export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;

  constructor({
                data = [],
                url = '/',
                label = '',
                value = 0,
                formatHeading = (value) => value,
                link = '',
                range = {}
              } = {}) {

    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.url = url;
    this.range = range;

    this.render();
  }

  async getData() {
    const url = new URL(this.url, `${process.env.BACKEND_URL}`);
    if (this.range.from) {
      url.searchParams.append('from', this.range.from);
    }
    if (this.range.to) {
      url.searchParams.append('to', this.range.to);
    }
    const result = await fetch(url.toString());
    return result.json();
  }

  getColumn(data) {
    const chooseData = Object.values(data);
    const maxValue = Math.max(...chooseData);
    return chooseData.map(item => {
      const size = this.chartHeight / maxValue;
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style='--value: ${Math.floor(item * size)}' data-tooltip='${percent}%'></div>`;
    })
      .join('');
  }

  getLink() {
    return this.link ? `<a class='column-chart__link' href='${this.link}'>View all</a>` : '';
  }

  getTemplate() {
    return (
      `<div class='column-chart column-chart_loading'>
         <div class='column-chart__title'>
             Total ${this.label}
             ${this.getLink()}
         </div>
         <div class='column-chart__container'>
           <div data-element='header' class = 'column-chart__header'>
           </div>
           <div data-element='body' class='column-chart__chart' style='--value: ${this.chartHeight}'>
             ${this.getColumn(this.data)}
           </div>
         </div>
    </div>`);
  }

  async load() {
    this.data = await this.getData();
    this.total = Object.values(this.data).reduce((sum, current) => sum + current, 0);
    this.subElements.body.innerHTML = this.getColumn(this.data);
    this.subElements.header.innerHTML = this.formatHeading(this.total);
    if (Object.values(this.data).length) {
      this.element.classList.remove('column-chart_loading');
    }
    return this.data;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getDataElements(this.element);
    await this.load();
  }

  getDataElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements]
      .reduce(
        (acc, elem) => ({
          ...acc,
          [elem.dataset.element]: elem
        }),
        {}
      );
  }

  async update(range) {
    this.range = range;
    await this.load();
    return this.data;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
