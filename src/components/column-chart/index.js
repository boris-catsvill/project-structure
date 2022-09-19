import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {
  chartHeight = 50;
  subElements = {};

  constructor({
    range = { from: new Date(), to: new Date() },
    label = '',
    link = '',
    url = '',
    formatHeading = data => data
  } = {}) {
    this.range = range;
    this.label = label;
    this.link = link;
    this.url = new URL(url, BACKEND_URL);
    this.formatHeading = formatHeading;

    this.render();
    this.elementFilling();
  }

  getTemplate() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: 50">
    <div class="column-chart__title">

    </div>
    <div class="column-chart__container">
      <div data-element="header" class="column-chart__header"></div>
      <div data-element="body" class="column-chart__chart">
        
      </div>
    </div>
  </div>
          `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.getSubElements();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      const elementName = element.dataset.element;
      this.subElements[elementName] = element;
    }
  }

  elementFilling() {
    const chartTitle = this.element.querySelector('.column-chart__title');

    if (this.checkLink()) {
      chartTitle.append(this.makeLink());
    }

    if (this.label) {
      chartTitle.prepend(this.makeLable());
    }

    this.update(this.range.from, this.range.to);
  }

  makeLink() {
    const anchor = document.createElement('a');

    anchor.className = 'column-chart__link';
    anchor.href = this.link;
    anchor.textContent = 'View all';

    return anchor;
  }

  makeLable() {
    const labelToChange = this.label[0].toUpperCase() + this.label.slice(1);

    return labelToChange;
  }

  checkLink() {
    return this.link;
  }

  makeURL(dateFrom = this.range.from, dateTo = this.range.to) {
    this.url.searchParams.set('from', dateFrom.toISOString());
    this.url.searchParams.set('to', dateTo.toISOString());
  }

  async update(dateFrom = this.range.from, dateTo = this.range.to) {
    try {
      this.element.classList.add('column-chart_loading');

      this.makeURL(dateFrom, dateTo);

      const responce = await fetchJson(this.url);

      if (!Object.values(responce).length) {
        return;
      }

      this.bodyChange(responce);

      this.data = responce;

      return this.data;
    } catch (error) {
      console.log(error);
    }
  }

  bodyChange(data) {
    this.subElements.header.innerHTML = Object.values(data).reduce(
      (total, value) => (total += value)
    );

    if (this.formatHeading) {
      const headerContent = this.subElements.header.innerHTML;

      this.subElements.header.innerHTML = this.formatHeading(headerContent);
    }

    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    this.subElements.body.innerHTML = Object.entries(data)
      .map(([key, value]) => {
        return `<div style='--value: ${Math.floor(
          value * scale
        )}' data-tooltip='${`<div><small>${new Date(key).toLocaleString(
          'default',
          options
        )}</small></div><strong>${this.formatHeading(value)}</strong>`}'></div>`;
      })
      .join('');

    this.element.classList.remove('column-chart_loading');
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
