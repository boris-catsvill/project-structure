import fetchJson from '../../utils/fetch-json.js';

export default class ColumnChart {
  element;
  subElements;
  chartHeight = 50;

  constructor({
                url = '',
                range = { from: '', to: '' },
                data = [],
                label = '',
                link = '',
                value,
                formatHeading = value => value
              } = {}) {
    this.url = url;
    this.range = range;
    this.data = data;
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const subElements = {};

    for (const elem of this.element.querySelectorAll('[data-element]')) {
      const name = elem.getAttribute('data-element');
      subElements[name] = elem;
    }

    return subElements;
  }

  getTemplate() {
      return `
            <div class='column-chart' style='--chart-height: ${this.chartHeight}'>
                <div class='column-chart__title'>
                    ${this.label}
                    ${this.link && '<a class="column-chart__link" href="' + this.link + '">Подробнее</a>'}
                </div>
                <div class='column-chart__container'>
                    <div data-element='header' class='column-chart__header'>${this.formatHeading(this.value)}</div>
                    <div data-element='body' class='column-chart__chart'></div>
                </div>
            </div>
        `;
  }

  getListElements(dataArr) {
    const data = this.getColumnProps(dataArr);

    return data.map(({ date, percent, value }) => `
            <div style='--value: ${value}' data-tooltip='${date}: ${value}'></div>
        `).join('');
  }

  getColumnProps(data) {
    const values = data.map(([ key, value ]) => value);
    const maxValue = Math.max(...values);
    const scale = this.chartHeight / maxValue;

    return data.map(([ key, value ]) => {
      return {
        date: key,
        value: String(Math.floor(value * scale)),
        percent: (value / maxValue * 100).toFixed(0) + '%'
      };
    });
  }

  async loadData(from, to) {
    const url = new URL(this.url);

    url.searchParams.set('from', from.toISOString());
    url.searchParams.set('to', to.toISOString());

    return await fetchJson(url);
  }

  async update(from, to) {
    this.element.classList.add('column-chart_loading');

    const data = await this.loadData(from, to);

    this.data = Object.entries(data);
    this.value = this.data.reduce((accum, curr) => accum + curr[1], 0);

    this.element.classList.remove('column-chart_loading');
    this.subElements.header.innerHTML = this.formatHeading(this.value);
    this.subElements.body.innerHTML = this.getListElements(this.data);

    return data;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

