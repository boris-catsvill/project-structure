//import ProductForm from "../../../components/product-form";
import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';

export default class Page {
  element;
  subElements = {};
  filters = {};
  components = {};

  // events
  evntSignal = new AbortController();

  //update
  inUpdate = true;

  onFilterUpdate = (event) => {
    if ((event.target.type === 'text') 
      && ( 0 < event.target.value.length ) 
      && ( event.target.value.length < 3  )) {return;}
    if (this.inUpdate) {return;}

    this.timerId = setTimeout( ()=> {
      this.updateTableComponent();
    }, 1000 );
  }

  toggleSidebar(event) {
    const sidePanel = event.target.closest('.sidebar__toggler');
    if (sidePanel) {
      document.body.classList.toggle("is-collapsed-sidebar");
    }    
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.filters = this.getFilters(this.element);
    await this.initComponents();
    this.renderComponents();

    this.inUpdate = false;

    this.initEventListeners();

    return this.element;
  }

  async updateTableComponent () { 
    const {from, to } = this.components.sliderContainer.getValue();
    const  dateParams = {
      '_embed': 'subcategory.category',
      'price_gte': from,
	    'price_lte': to,
    }
    for (const [filterKey, filterVal] of Object.entries( this.filters ) ) {
      // trim 'filter' part and make lower case
      let fldName = filterKey.slice( 6 ).toLowerCase();
      switch (fldName) {
        case 'name':
          if (filterVal.value) {
            dateParams['title_like'] = filterVal.value.trim();
          };          
          break;      
        default:
          if (filterVal.value) {
            dateParams[fldName] = filterVal.value;
          };           
          break;
      } 
    }

    this.components.sortableTable.setFilter(dateParams);
    await this.components.sortableTable.refresh(true);
    this.inUpdate = false;
  }

  async initComponents() {
    /**/
    this.components.sliderContainer = new DoubleSlider({
      min: 0,
      max: 4000,
      formatValue : value => '$' + value
    });
    
    const sortableTable = new SortableTable(header, {
      url: `api/rest/products`,
      isSortLocally: false,
      rowRef : { object:`products`, field :'id' }
    }, {'_embed': 'subcategory.category'});
    this.components.sortableTable = sortableTable; 
  }

  get template () {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h2 class="page-title">Products</h2>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
      <div class="content-box content-box_small">
      <form class="form-inline">
        <div class="form-group">
          <label class="form-label">Сортировать по:</label>
          <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
        </div>
        <!-- DoubleSlider component -->
        <div class="form-group" data-element="sliderContainer">
        <label class="form-label">Price:</label>
        </div>
        <div class="form-group">
          <label class="form-label">Статус:</label>
          <select class="form-control" data-element="filterStatus">
            <option value="" selected="">Any</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
      </form>
      </div>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }
  
  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => { 
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  getFilters ($element) {
    const elements = $element.querySelectorAll('.form-control');
    return [...elements].reduce((accum, subElement) => { 
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  initEventListeners () {
    const { signal } = this.evntSignal;    
    const sidePanel = document.querySelector('.sidebar__toggler');
    sidePanel.addEventListener('click', (event) => this.toggleSidebar(event) , { signal });
      
    this.filters.filterName.addEventListener("input", this.onFilterUpdate , { signal });
    this.subElements.sliderContainer.addEventListener("range-select", this.onFilterUpdate , { signal });
    this.filters.filterStatus.addEventListener("change", this.onFilterUpdate , { signal });    
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    if (this.evntSignal) {
      this.evntSignal.abort();
    }       
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
