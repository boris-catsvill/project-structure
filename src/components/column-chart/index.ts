import { ROUTER_LINK } from '../../router/router-link';
import { BaseComponent } from '../../base-component';
import { IBase } from '../../types/base';

export class ColumnChart extends BaseComponent implements IBase {
  chartHeight = 50;
  label: string;
  link: string;
  formatHeading: (data: any) => string;
  data: Array<number>;
  #loading: boolean;

  constructor({ data = [], label = '', link = '', formatHeading = (data: string) => data } = {}) {
    super();
    this.label = label;
    this.link = link;
    this.data = data;
    this.formatHeading = formatHeading;
    this.render();
  }

  set isLoading(loading: boolean) {
    this.#loading = loading;
    if (loading) {
      this.element.classList.add('column-chart_loading');
    } else {
      this.element.classList.remove('column-chart_loading');
    }
  }

  get template() {
    return `<div class='column-chart column-chart_loading' style='--chart-height: ${
      this.chartHeight
    }'>
                <div class='column-chart__title'>
                    ${this.label}
                    ${this.getLink()}
                </div>
                <div class='column-chart__container'>
                    <div data-element='header' class='column-chart__header'>${this.getHeader()}</div>
                    <div data-element='body' class='column-chart__chart'>${this.getBody()}</div>
                </div>
            </div>`;
  }

  getLink() {
    return this.link
      ? `<a is='${ROUTER_LINK}' href='${this.link}' class='column-chart__link'>View all</a>`
      : ``;
  }

  update(data: Array<number>) {
    this.data = data;
    this.subElements.header.innerHTML = this.getHeader();
    this.subElements.body.innerHTML = this.getBody();
    this.isLoading = false;
  }

  getHeader() {
    const value = this.data.reduce((acc: number, val: number) => acc + val, 0);
    return this.formatHeading(value);
  }

  getBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        const percent = ((item / maxValue) * 100).toFixed(0) + '%';
        const value = String(Math.floor(item * scale));
        return `<div style='--value: ${value}' data-tooltip='${percent}'></div>`;
      })
      .join('');
  }
}
