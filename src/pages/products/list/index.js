import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from './products-header.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class Page {
  
  element;
  subElements = {};
  url = new URL('/api/rest/products', BACKEND_URL);
  productTable;
  maxPrice = 4000;

async render() {   
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getHTML();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.renderComponents();
    this.addEventListeners();
    
    this.progressBar = document.getElementsByClassName("progress-bar")[0];
    if (this.progressBar) {
        this.progressBar.style.display = "none";
    }
                
    return this.element;
}

addEventListeners(){
  this.element.addEventListener("range-select", this.rangeSelected);
  this.subElements.filterStatus.addEventListener("change", this.statusSelected);
  this.subElements.filterName.addEventListener("input", this.nameInputed);

}

getHTML() {
  return `<div class="product-list">
  <div class="content__top-panel">
      <h1 class="page-title">Products</h1>
      <a href="/products/add" class="button-primary">Add</a>
  </div>

    <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Filter by:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Name">
          </div>

          <div class="form-group" data-element="sliderContainer">
          <label class="form-label">Price:</label>
                <!-- RangeSlider component -->      
          </div>
          
      <div class="form-group">
          <label class="form-label">Status:</label>
          <select class="form-control" data-element="filterStatus">
            <option value="" selected="">Any</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
      </div>
      </form>
    </div>
  
  <div data-element="productsContainer" class="products-list__container">
    <div data-element="sortableTable">
        <!-- sortable-table component -->
    </div>
  </div>    
  </div>`;
}

renderComponents() {
  this.addRangeSlider();        
  this.addSortableTable();
} 

addRangeSlider() {
  const rangeSlider = new DoubleSlider({min: 0, max: this.maxPrice});
  this.subElements.sliderContainer.append(rangeSlider.element)
}

addSortableTable() {
  const newTable = new SortableTable(header, {
  url: this.url,
  isSortLocally: true,
  params: {
    '_embed': 'subcategory.category'
  },
  hrefPath: '/products/' 
  });

  this.subElements.sortableTable.append(newTable.element);
  this.productTable = newTable;
}

rangeSelected = async (event) => {
  const {from, to} = event.detail;
  this.productTable.params.price_gte = from;
  this.productTable.params.price_lte = to;
  await this.filterTable();  
};

statusSelected = async (event) => {
  await this.filterParams(event, 'status')
};

nameInputed = async (event) => {
  await this.filterParams(event, 'title_like')  
};

async filterParams(event, name) {
  const filterName = event.target.value;
  if (filterName) {
    this.productTable.params[name] = filterName;
  } else {
    delete this.productTable.params[name];
    this.productTable.url.searchParams.delete(name);
  }  
  await this.filterTable();  
};

async filterTable() {

  this.progressBar.style.display = "block";
  await this.productTable.filter();
  this.progressBar.style.display = "none";

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
  if (this.element) {
    this.element.remove();
  }
}

destroy() {
  this.remove();
  this.element = null;
  this.subElements = {};
  this.productTable.destroy();
}
  
  
}
