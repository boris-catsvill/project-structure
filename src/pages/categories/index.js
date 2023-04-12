import fetchJson from '../../utils/fetch-json.js';
import CategoryComponent from '../../components/categories/index.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Categories {
	
	categoriesData = [];
	categoryComponent = {};
	categoryComponents = [];
	
  constructor() {    
	
  }
	
	
	async initCategoryComponent() {
		
		this.categoriesData = await this.loadCategories();
		
		for (const category of this.categoriesData) {
			this.categoryComponents.push(new CategoryComponent(category));
		}
		
		return this.categoryComponents;
	}
	
  async loadCategories() {
    const categoriesUrl = new URL("/api/rest/categories", BACKEND_URL);
    categoriesUrl.searchParams.set("_sort", "weight");
    categoriesUrl.searchParams.set("_refs", "subcategory");
    return await fetchJson(categoriesUrl);
  }
	

	
	get template () {
    return `<div class="categories">
							<div class="content__top-panel">
								<h1 class="page-title">Категории товаров</h1>
							</div>
							<div data-element="categoriesContainer">
								
							</div>
						</div>`;
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
				
		const components = await this.initCategoryComponent();
    this.renderComponents(components);

    return this.element;
  }


  getSubElements (element) {
		
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
	
	
	renderComponents(components) {    
		const { categoriesContainer } = this.subElements;
		
		for (const component of components) {
			categoriesContainer.append(component.element);

		}
   
  }

  destroy () {
		for (const component of this.categoryComponents) {
			component.destroy();
		}
		
		this.categoryComponents = [];
  }
	
}