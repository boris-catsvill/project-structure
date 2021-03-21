import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './header.js';

export default class Page {
    element;
    subElements = {};
    components = {};
    sliderParams = {min: 0, max: 4000};
 
    render() {
       const element = document.createElement('div');
       element.innerHTML = this.template();
 
       this.element = element.firstElementChild;
       this.subElements = this.getSubElements(this.element);
 
       this.initComponents();
       this.renderComponents();
 
       this.initEnentListeners();
 
       return this.element;
    }
 
    template() {
        return `
            <div class="products-list">
                <div class="content__top-panel">
                    <h2 class="page-title">Товары</h2>
                    <a href="/products/add" class="button-primary">Добавить товар</a>
                </div>
                <div class="content-box content-box_small">
                  <form class="form-inline">
                    <div class="form-group">
                      <label class="form-label">Сортировать по:</label>
                      <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
                    </div>
                    <div class="form-group" data-element="sliderContainer">
                      <label class="form-label">Цена:</label>
                    </div>
                    <div class="form-group">
                      <label class="form-label">Статус:</label>
                      <select class="form-control" data-element="filterStatus">
                        <option value="" selected="">Любой</option>
                        <option value="1">Активный</option>
                        <option value="0">Неактивный</option>
                      </select>
                    </div>
                  </form>
                </div>
                <div data-elem="productsContainer" class="products-list__container">
                    <div class="sortable-table" data-element="sortableTable"></div>
                </div>
            </div>
        `;
    }
 
    initComponents() {
      const sortableTable = new SortableTable(header, {
          url: `api/rest/products?_embed=subcategory.category`,
          isSortLocally: false,
      });

      const sliderContainer = new DoubleSlider(this.sliderParams);
  
      this.components = {sortableTable, sliderContainer};
    }
 
    renderComponents() {
      for (const component of Object.keys(this.components)) {
          const subElement = this.subElements[component];
          const {element} = this.components[component];
  
          subElement.append(element);
      }
    }
 
    initEnentListeners() {
      this.components.sliderContainer.element.addEventListener('range-slider', event => {
        const {from, to} = event.detail;
        this.updateComponents(from, to);
      });

      this.subElements.filterStatus.addEventListener('change', event => this.statusFilter(event));
      this.subElements.filterName.addEventListener('input', event => this.filterProductName(event));
  
      this.components.sortableTable.subElements.emptyPlaceholder.querySelector('button').addEventListener('pointerdown', this.clearFilters);
    }

    statusFilter({target}) {
      const {from, to} = this.components.sliderContainer.getValue();
      
      target.value
        ? this.components.sortableTable.url.searchParams.set('status', target.value) 
        :this.components.sortableTable.url.searchParams.delete('status');

      this.updateComponents(from, to);
    }

    filterProductName = ({target}) => {
      const {from, to} = this.components.sliderContainer.getValue();

      target.value
        ? this.components.sortableTable.url.searchParams.set('title_like', target.value) 
        : this.components.sortableTable.url.searchParams.delete('title_like');
  
      this.updateComponent(from, to);    
    }
 
    async updateComponents(from, to) {
      const sortParams = this.components.sortableTable.sortParams;
      
      this.components.sortableTable.start = 1;
      this.components.sortableTable.end = 20;
      this.components.sortableTable.url.searchParams.set('price_gte', from);
      this.components.sortableTable.url.searchParams.set('price_lte', to);
  
      const data = await this.components.sortableTable.getDataRequest(sortParams.field, sortParams.order, 1, 20);
  
      this.components.sortableTable.getRows(data);
    }
 
    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
    
            return accum;
        }, {});
    }
 
    remove() {
        this.element.remove();
    }
 
    destroy() {
        this.remove();
    
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }
}
