import fetchJson from '../../utils/fetch-json.js';

export default class ColumnChart {
  data;
  subElements = {};

  constructor({
                url = '',
                range = {},
                label = '',
                value = 0,
                link = '',
                linkDescription = '',
                formatHeading = (data) => data
              } = {}) {
    this.label = label;
    this.link = link;
    this.linkDescription = linkDescription;
    this.url = url;
    this.value = value;
    this.formatHeading = formatHeading;
    this.columnProps = null;
    this.chartHeight = 50;
    this.renderSkeleton();
    this.update(range.from, range.to);
  }

  getTemplate() {
    return `
      <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          <a href="${this.link}" class="column-chart__link">${this.linkDescription}</a>
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">Loading</div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    </div>
`}

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  renderSkeleton() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    if (!this.columnProps) {
      this.element.className = 'column-chart_loading';
    }
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    this.columnProps = data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  async update(from = new Date(), to = new Date()) {
    const path = new URL(this.url, process.env.BACKEND_URL);
    path.searchParams.set('from', from.toISOString());
    path.searchParams.set('to', to.toISOString());
    const responseData = await fetchJson(path);
    this.data = Object.values(responseData);
    this.value = this.formatHeading(this.data.reduce((previousValue, currentValue) => previousValue + currentValue, 0));
    this.getColumnProps(this.data);
    this.subElements.header.innerHTML = this.value;
    this.subElements.body.innerHTML = '';
    for (const columnProp of this.columnProps) {
      const column = document.createElement("div");
      column.dataset.tooltip = columnProp.percent;
      column.style.setProperty('--value', columnProp.value);
      this.subElements.body.append(column);
    }
    this.element.classList.remove('column-chart_loading')
    return responseData;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
  }
}
