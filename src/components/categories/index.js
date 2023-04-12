import SortableList from '../../utils/sortable-list.js';

export default class CategoryComponent {
  
  element; // DOM element
  subElements = {};

  
  constructor (data) {
		this.data = data
		this.render();
  }
  
	
  

  /**
	 * Шаблон
	 */
  get template () {
    return `
		<div class="category category_open" data-id="bytovaya-texnika">
		<header class="category__header">
			${this.data.title}
		</header>
		
	</div>
    `;
	
  }
  

	
  async render () {
				
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();		

		this.createSubcategoriesList();

    return this.element;

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
	

  
	
  createSubcategoriesList() {
	
    const wrapper = document.createElement('div');
		
    wrapper.innerHTML = 
		`<div class="category__body">
			<div class="subcategory-list">
			
			</div>
		</div>`;
		
    const selectElem = wrapper.firstElementChild;		    
		const sortableList = new SortableList({
			items: this.data.subcategories.map(item => {

				const element = document.createElement("li");
        element.classList.add("categories__sortable-list-item");
        element.dataset.grabHandle = ""; 
        element.dataset.id = item.id;
				element.innerHTML = 
				`<strong>${item.title}</strong>
				<span><b>${item.count}</b> products</span>`;	
				return element;
			})
		});
		
		selectElem.firstElementChild.append(sortableList.element)
    this.element.append(selectElem);
  }  
	

  
	
  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
  
}
