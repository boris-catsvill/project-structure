import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {

    chartHeight = 50;
  
    constructor({ data = [],url = '',range = {}, label = '', link ='', value = 0, formatHeading = data => data } = {}) {
      this.data = data;
      this.label = label;
      this.link = link;
      this.value = value;
      this.formatHeading = formatHeading;
      this.range = range;
      this.url = url;
      
      this.render();
    }
  
    getTemplate() {
      return `
       <div class="column-chart" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          ${this.label}
          ${this.link ?
            `<a href="${this.link}" class="column-chart__link">View all</a>`:``}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.renderColumns(this.data)}
          </div>
        </div>
        </div>
      `;
    }

    async loadData(from,to){
      
      this.element.classList.add('column-chart_loading');
      const url = new URL(this.url, BACKEND_URL);
      url.searchParams.append('from', from);
      url.searchParams.append('to', to);
  
      const data = await fetchJson(url);
        
      const resultArr = Object.values(data);
      this.data = data;                 
      if(resultArr.length)
          this.element.classList.remove('column-chart_loading');

      this.value = resultArr.reduce((sum, current) => sum + current, 0);
      this.subElements.header.innerHTML = this.value;
      this.subElements.body.innerHTML = this.renderColumns(resultArr);

      this.element.classList.remove('column-chart_loading');
      
       return this.data;
    }
  
    render() {

      const { from, to } = this.range;
      
      const element = document.createElement("div");
      element.innerHTML = this.getTemplate(); 
  
      
      this.element = element.firstElementChild; 
      this.subElements = this.getSubElements(); 
      this.loadData(from,to);
    }
  
    renderColumns(data){
  
      if (!data.length) return '';
     
      return `${this.getColumnProps(data).map(item =>
                  `<div style="--value: ${item.value}" data-tooltip="${item.percent}"></div>`).join('')}`;
    }
    
    async update(from,to){
     
      return await this.loadData(from, to);
    }
      
    getColumnProps(data) {
      const maxValue = Math.max(...data);
      const scale = this.chartHeight / maxValue;
  
      return data.map(item => {
        return {
          percent: (item / maxValue * 100).toFixed(0) + '%',
          value: String(Math.floor(item * scale))
        };
      });
    }

    getSubElements() {

      const result = {};
      const elements = this.element.querySelectorAll("[data-element]");
  
      for (const subElement of elements) {
        const name = subElement.dataset.element;
        result[name] = subElement;
      }
  
      return result;
  }
  
  remove() {
    this.element.remove();
    this.subElements = {}
  }
    
  destroy() {
    this.remove();
  }
}
