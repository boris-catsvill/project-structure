import ProductForm from "../../../components/product-form";
import SortableTable from "../../../components/sortable-table";
import ProductFilter from "../../../components/product-filter";
import header from "./header-config";

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

    const sortableTable = new SortableTable(header, {
      url: "api/rest/products?_embed=subcategory.category",
      isSortLocally: false
    });
		
		const productFilter = new ProductFilter();



    this.components.sortableTable = sortableTable;   
    this.components.productFilter = productFilter;

    this.components.productFrom = new ProductForm();
  }
		
	
	
	renderComponents () {
    Object.keys(this.components).forEach(async (component) => {
			await this.subElements;			
      const root = this.subElements[component];
      const { element } =  this.components[component];

      root.append(element);
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
		
		// clear filter
		document.addEventListener('clear-filter', async event => {
			this.components.productFilter = new ProductFilter();
			this.subElements.productFilter.innerHTML = "";
			this.subElements.productFilter.append(this.components.productFilter.element);
			this.updateTableComponent();
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
