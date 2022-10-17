import errorHandler from "../store/errorHandler";

export default class ColumnChart {
    chartHeight = 50;
    data = []
    scale = 1
    totalValueOfData = 0
    statusOfLoading = 'fulfilled'

    constructor({
      label: title = '',
      link = '#',
      url = ``,
      formatHeading = item => `${item}`,
      range: {
        from = new Date(),
        to = new Date()
      } = {},
    } = {}) {
      this.formatHeading = formatHeading;
      this.range = {from: from.toISOString(), to: to.toISOString()};
      
      this.url = new URL(url);
      this.updateURLByRange();

      this.title = title;
      this.linkOfTitle = this.getLinkOfTitle(link);

      this.render();
    }

    getLinkOfTitle(link) {
      return !link.length
        ? ''
        : `<a class="column-chart__link" href="${link}">Подробнее</a>`;
    }

    createChart(currentValue) {
      const currentValueByScale = Math.floor(this.scale * currentValue);
      return `<div style="--value: ${currentValueByScale}" data-tooltip="${currentValue}"></div>`;
    }

    getColumnChartBody() {
      return this.data.map((currentValue) => this.createChart(currentValue)).join('');
    }

    get elementOfBodyColumnChart() {
      const element = document.createElement('div');
      const bodyOfElement = (
        `<div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
                      <div class="column-chart__title">
                          Total ${this.title}
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

    updateURLByRange() {
      this.url.searchParams.set('from', this.range.from);
      this.url.searchParams.set('to', this.range.to);
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
        this.updateURLByRange();

        const response = await fetch(this.url.toString());
        const JSONData = await response.json();
        this.data = Object.values(JSONData);

        this.updateProperties();
        this.switchStatusOfLoading();

        return JSONData;
      } catch (error) {
        errorHandler(error);
        //throw new Error('Ошибка сети/Ошибка на сервере');
      }
    }

    getSubElements() {
      const result = {};
      const dataElements = this.element.querySelectorAll('[data-element]');
      for (const dataElement of dataElements) {
        const name = dataElement.dataset.element;
        result[name] = dataElement;
      }
      return result;
    }

    async render() {
      this.element = this.elementOfBodyColumnChart;
      this.subElements = this.getSubElements();

      await this.updateData();
      this.updateElement();
    }


    async update(from = this.range.from, to = this.range.to) {
      this.range = { ...this.range, ...{from: from.toISOString(), to: to.toISOString()} };
 
      const data = await this.updateData();
      this.updateElement();

      return data;
    }
    remove() {
        this.element?.remove();
    }
    destroy() {
      this.remove();
      this.element = null;
    }
}


