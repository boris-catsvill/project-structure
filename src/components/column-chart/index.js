export default class ColumnChart {
  element;
  elementColumns;
  elementHeader;
  chartHeight = 50;
  constructor({
    data = [],
    label = '',
    link = '',
    formatHeading = data => {
      return data;
    }
  } = {}) {
    this.data = data;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
  }

  getLink() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }

  getColumnProps(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(data)
      .map(([key, item]) => {
        const value = String(Math.floor(item * scale));
        const date = new Date(key);

        return `<div style="--value: ${value}" 
      data-tooltip="<div><small>${date.toLocaleString('default', { dateStyle: 'medium' })}</small>
      </div><strong>${this.formatHeading(item)}</strong>"></div>`;
      })
      .join('');
  }

  getClassName() {
    return this.data.length === 0 ? 'column-chart column-chart_loading' : 'column-chart';
  }

  getTemplate() {
    return `
      <div class="${this.getClassName()}" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
            ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          ${this.getHeader()}
          </div>
          <div data-element="body" class="column-chart__chart">
          ${this.getColumnProps(this.data)}
          </div>
        </div>
      </div>
    </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.elementColumns = this.element.querySelector('.column-chart__chart');
    this.elementHeader = this.element.querySelector('.column-chart__header');
    this.initEventListeners();
  }

  update(newData = []) {
    this.data = newData;

    this.elementColumns.innerHTML = this.getColumnProps(this.data);
    this.elementHeader.innerHTML = this.getHeader();
    if (!this.data.length) {
      this.element.className = this.getClassName();
    } else {
      this.element.className = this.getClassName();
    }
  }

  initEventListeners() {
    this.elementColumns.addEventListener('pointerover', this.onMouseOver);
    this.elementColumns.addEventListener('pointerout', this.onMouseOut);
  }

  onMouseOver = event => {
    this.elementColumns.classList.add('has-hovered');
    event.target.classList.add('is-hovered');
  };

  onMouseOut = event => {
    this.elementColumns.classList.remove('has-hovered');
    event.target.classList.remove('is-hovered');
  };

  getHeader() {
    const headerValue = Object.values(this.data).reduce(
      (prev, curr) => (prev += parseInt(curr)),
      0
    );

    return this.formatHeading(headerValue);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.elementColumns = {};
    this.elementHeader = {};
  }
}
