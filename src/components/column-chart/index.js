import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ColumnChart {

  chartHeight = 50;
  element;
  subElements = {};
  
  constructor({label = '', value = 0, link = '', formatHeading = (data) => data, url = '', range = {from: new Date(), to: new Date()}} = {})
      {        
      this.label = label;
      this.value = value;
      this.link = link;
      this.formatHeading = formatHeading;
      this.data = {}
      this.max = 0;
      this.url = new URL(url, BACKEND_URL);
      this.range = range;
      
      this.render();
      this.update(this.range.from, this.range.to);
      }

      render() {
      
          const element = document.createElement('div');
          element.innerHTML = this.getHTML();
          this.element = element.firstElementChild;
          this.subElements = this.getSubElements();

          this.subElements.body.addEventListener('pointerover', this.onChartMouseOver);
          this.subElements.body.addEventListener('pointerout', this.onChartMouseOut);
      }
  
      getHTML() {  
          
          return `
          <div class="column-chart_loading" class="column-chart" style="--chart-height: ${this.chartHeight}">
              <div class="column-chart__title">Total ${this.label} ${this.getLink()}</div>        
              <div class="column-chart__container">
                  <div data-element="header" class="column-chart__header">${this.value}</div>
                  <div data-element="body" class="column-chart__chart">${this.getCharts()}</div> 
              </div>  
          </div>`;
  
      }

      getLink() {
          return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
      }
  
      getCharts() {
  
          if (this.max === 0) return ''; 
          
          const coef = this.chartHeight / this.max; 
          const columns = Object.entries(this.data).map(elem => {
            const [key, value] = elem;
            const dArr = key.split('-');
            const date = new Date(dArr[0], dArr[1]-1, dArr[2]).toLocaleString('en', {year: 'numeric', month: 'short', day: 'numeric'});
            const chartValue = Math.floor(coef*value);
            return `<div style="--value: ${chartValue}" data-tooltip="<div><small>${date}</small></div>
                            <strong>${this.formatHeading(value)}</strong>"></div>`;
          });
  
          return columns.join("");
  
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
      
      async update(from, to) {

          this.element.classList.add('column-chart_loading');
          await this.getJson(from, to);

          if (Object.values(this.data).length) {
              this.element.classList.remove('column-chart_loading');
              this.updateCharts();
          }

          return this.data;
      }

      async getJson(from, to){

          this.url.searchParams.set('from', from.toISOString());
          this.url.searchParams.set('to', to.toISOString());
          try {
              const data = await fetchJson(this.url);
              this.data = data;
          } catch(err) {
              throw new Error(err);
              };                
              
      }

      updateCharts() {
          
          this.value = 0;
          this.max = 0;
          
          for (const value of Object.values(this.data)) {
              this.value += value;
              this.max = this.max < value ? value : this.max;
          }
          
          this.subElements.header.textContent = this.formatHeading(this.value);
          this.subElements.body.innerHTML = this.getCharts();
  
      }

      onChartMouseOver = event =>{                
        const element = event.target.closest('[data-tooltip]');
        if (element) {
            element.classList.add("is-hovered");
            this.subElements.body.classList.add("has-hovered");
        }       
      }
      
      onChartMouseOut = event =>{        
        const element = event.target.closest('[data-tooltip]');        
        if (element) {
            element.classList.remove("is-hovered");
            this.subElements.body.classList.remove("has-hovered");
        } 
      }


      remove() {
          if (this.element) {
              this.element.remove();
          }
      }
        
      destroy() {
          document.removeEventListener('pointerover', this.onChartMouseOver);
          document.removeEventListener('pointerout', this.onChartMouseOut);
          this.remove;
          this.element = null;
          this.subElements = {};
      }

}