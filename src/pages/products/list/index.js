import ProductForm from "../../../components/product-form";
import SortableTable from "../../../components/sortable-table";
import ProductFilter from "../../../components/product-filter";
import fetchJson from "../../../utils/fetch-json";
import header from "./header-config";
import debounce from "../../../utils/debounce";

export default class Page {
  element;
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
		<div class="products-list">
			<!-- Header -->
			<div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
			
			<!-- Double-slider -->
			<div data-element="productFilter" class="content-box content-box_small">
				
			</div>
			
			<!-- Table -->
			<div data-element="productsContainer" class="products-list__container">
				<div data-element="sortableTable"></div>
			</div>`;

    this.element = element.firstElementChild;

    await this.initComponents();
    this.renderComponents();
		
		this.initEventListeners();
		
		this.subElements = this.getSubElements(this.element);

    return this.element;
		
  }

  async initComponents() {
    //const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';
    const productId = '101-planset-lenovo-tab-p10-tb-x705l-32-gb-3g-lte-belyj';
	

    const sortableTable = new SortableTable(header, {
      url: "api/rest/products",
      isSortLocally: false
    });
		
		const productFilter = new ProductFilter();



    this.components.sortableTable = sortableTable;   
    this.components.productFilter = productFilter;

    this.components.productFrom = new ProductForm(productId);
  }
		
	
	
	renderComponents () {
    Object.keys(this.components).forEach(async (component) => {
			await this.subElements;			
      const root = this.subElements[component];
      const { element } =  this.components[component];

      root?.append(element);
    });
  }
	
	

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
		
		document.addEventListener('price-select', event => {
			this.updateTableComponent(event.detail);
		 });
		 
		document.addEventListener('filter-name', event => {
		this.updateTableComponent(event.detail);
		});
		
		document.addEventListener('filter-status', event => {
			const { filterStatus }  = event.detail;
			
			if (!filterStatus.length) {
				event.detail.filterStatus = null;
			}
			this.updateTableComponent(event.detail);
			
		});
  }


	
	async updateTableComponent ({from, to, filterName, filterStatus} = {}) {
		this.components.sortableTable.updateFromFilter({from, to, filterName, filterStatus});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
