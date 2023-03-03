
import fetchJson from '../../../utils/fetch-json.js';
import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';
import tooltip from "../../../components/tooltip/index.js";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  element;
  subElements = {};
  components = {};
  url = new URL('api/rest/products',BACKEND_URL);
  rangeFrom = 0;
  rangeTo = 4000;
  filterStatus;
  dulterName = ''


  initComponents(){

    const sliderContainer = new DoubleSlider(
      {
        min: this.rangeFrom,
        max: this.rangeTo,
        formatValue: value => '$' + value
      }); 
    
    this.url.searchParams.set('_embed','subcategory.category');
    const productsContainer = new SortableTable(
        header,
        {
            url :this.url,
        }
    )
      
    tooltip.initialize();
    
    this.components.productsContainer = productsContainer;
    this.components.sliderContainer = sliderContainer;
}
async renderComponents() {

  Object.keys(this.components).forEach(componentName =>{

            const root = this.subElements[componentName];
            const {element} = this.components[componentName];
            root.append(element);
        })
}

render(){
  
  const element = document.createElement('div');
  element.innerHTML = this.getTemplate();
  this.element = element.firstElementChild;
  
  this.subElements = this.getSubElements();

  this.initComponents()
  this.renderComponents();
  this.addEventListeners();
 
  return this.element;
}

addEventListeners(){

  this.element.addEventListener('range-select',this.onRangeSelect);
  this.subElements.filterName.addEventListener('input',this.onFilterNameChange);
  this.subElements.filterStatus.addEventListener('change',this.onFilterStatusChange);

}

async loadData(){

  this.url.searchParams.set('_start','0');
  this.url.searchParams.set('_end','30');
  this.url.searchParams.set('_sort','title');
  this.url.searchParams.set('_order','asc');
  this.url.searchParams.set('price_gte', this.rangeFrom);
  this.url.searchParams.set('price_lte', this.rangeTo);
 
  if(this.filterName)
    this.url.searchParams.set('title_like', this.filterName);
  else 
    this.url.searchParams.delete('title_like')
  if(this.filterStatus)
    this.url.searchParams.set('status', this.filterStatus);
  else
    this.url.searchParams.delete('status')

  const data = await fetchJson(this.url);
  
  this.updateComponents(data);
}

updateComponents(data){

  this.components.productsContainer.tableData =[];
  this.components.productsContainer.subElements.body.innerHTML = '';
  this.components.productsContainer.update(data);
  this.components.productsContainer.url = this.url;
}

onFilterNameChange = (event) =>{

  this.filterName =  event.target.value;
  this.loadData();
}

onFilterStatusChange = (event) =>{
  this.filterStatus = event.target.value;
  this.loadData();
}

onRangeSelect = (event) =>{

  this.rangeFrom = event.detail.from;
  this.rangeTo = event.detail.to;
  this.loadData();

}

getTemplate(){

  return`
  <div class="products-list">
    <div class="content__top-panel">
      <h1 class="page-title">Товары</h1>
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
    <div data-element ="productsContainer" class="products-list__container">
      
    </div>
  </div>
  `
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


destroy() {
  for (const component of Object.values(this.components)) {
    component.destroy();
  }
}}
