import NotificationMessage from '../notification/index.js';

import fetchJson from '../../utils/fetch-json';

export default class ColumnChart {
  chartHeight = 50;
  element;
  subElements = {};

  constructor ({url = '', range = {}, label = '', value = 0, link = '#', formatHeading} = {}) {
    this.data = [];
    this.url = url;
    this.from = range.from || new Date();
    this.to = range.to || new Date();
    this.label = label;
    this.value = value;
    this.formatHeading = formatHeading;
    this.link = link;
  
    this.render();
    this.update(this.from, this.to);
  }

  getColumnProps = () => {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    
    return this.data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  renderCard = data => {
    return `
      <div class="column-chart__title">
          ${this.label}
          <a class="column-chart__link" href="${this.link}">View all</a>
      </div>
      <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
              ${this.value}
          </div>
          <div data-element="body" class="column-chart__chart">
              ${data}
          </div>
      </div>
    `;
  }

  renderPreloader = () => {
    return this.renderCard('<img src="./charts-skeleton.svg" alt="loading-charts"></img>');
  }

  renderData = () => {
    return this.renderCard(this.getColumnProps().map(({percent, value}) => {
      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    }).join(''));
  }

  update = (from, to) => {
    this.data = [];
    this.render();

    return this.getNewData(from, to).then(data => {
      this.data = data;
      const newValue = data.reduce((prev, curr) => prev + curr);
      this.value = this.formatHeading ? this.formatHeading(newValue) : newValue;

      this.render();
      return data;
    });
  }

  getNewData = async (from, to) => {
      try {
        const data = await fetchJson(`${process.env.BACKEND_URL}${this.url}?from=${from}&to=${to}`);

        return Object.values(data);
      } catch (error) {
        const notification = new NotificationMessage(error.message, {
          duration: 2000,
          type: 'error'
        });
          
        notification.show();
      }
  }

  getSubElements = (element) => {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');
  
    for (const subElement of elements) {
      const name = subElement.dataset.element;
  
      result[name] = subElement;
    }
  
    return result;
  }

  remove = () => {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy = () => {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  renderElement = (element) => {
    if (this.data.length) {
      element.className = 'column-chart';

      element.innerHTML = this.renderData();
    } else {
      element.className = 'column-chart column-chart_loading';

      element.innerHTML = this.renderPreloader();
    }

    return element;
  }

  render = () => {
    if (this.element) {
      this.element = this.renderElement(this.element);
    } else {
      const wrapper = document.createElement('div');

      wrapper.style = `--chart-height: ${this.chartHeight}`;

      this.element = this.renderElement(wrapper);
    }

    this.subElements = this.getSubElements(this.element);
  }
}