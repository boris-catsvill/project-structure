import fetchJson from '@/utils/fetch-json.js';

export default class ColumnChart {
  element;
  subElements = {};
  chartHeight = 50;
  isLoading = true;

  onPointerOver = event => {
    const element = event.target.closest('[data-tooltip]');

    if (!element) return;

    element.classList.add('is-hovered');
    this.subElements.body.classList.add('has-hovered');
  }

  onPointerOut = event => {
    const element = event.target.closest('[data-tooltip]');

    if (element) {
      element.classList.remove('is-hovered');
    }

    this.subElements.body.classList.remove('has-hovered');
  }

  constructor({
    url = '',
    range = this.getDefaultRange(),
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.url = new URL(url, process.env.BACKEND_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.initEventListeners();
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);

    this.update(this.range.from, this.range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart"></div>
        </div>
      </div>
    `;
  }

  async update(from, to) {
    this.setLoading(true);

    const data = await this.loadData(from, to);

    this.setNewRange(from, to);

    this.subElements.header.textContent = this.getHeaderValue([]);
    this.subElements.body.innerHTML = '';

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.getHeaderValue(data);
      this.subElements.body.innerHTML = this.getColumnBody(data);
    }

    this.setLoading(false);

    return data;
  }

  loadData(from, to) {
    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    return fetchJson(this.url);
  }

  setLoading(value) {
    if (value) {
      this.isLoading = true;
      this.element.classList.add('column-chart_loading');
    } else {
      this.isLoading = false;
      this.element.classList.remove('column-chart_loading');
    }
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, value) => accum + value, 0));
  }

  getColumnBody(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.entries(data)
      .map(([key, value]) => {
        const percent = (value / maxValue * 100).toFixed(0);
        const tooltip = `
          <div><small>${key.toLocaleString(['ru', 'en'], {dateStyle: 'medium'})}</small></div>
          <strong>${percent}%</strong>
        `;

        return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${tooltip}"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  getDefaultRange() {
    const now = new Date();
    const from = new Date(now.setMonth(now.getMonth() - 1));
    const to = new Date();

    return { from, to };
  }

  setNewRange(from, to) {
    this.range.from = from;
    this.range.to = to;
  }

  initEventListeners() {
    this.subElements.body.addEventListener('pointerover', this.onPointerOver);
    this.subElements.body.addEventListener('pointerout', this.onPointerOut);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
