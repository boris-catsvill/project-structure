import Categories from '../../components/categories/index.js';

export default class Page {
  element;
  subElements = {};
  components = {};
    
  render() {

    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
      
    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    
    return this.element;
  }

  initComponents(){

    const categories = new Categories();
    this.components.categoriesContainer = categories;
  }

  getTemplate(){

    return `

      <div class="categories">
          <div class="content__top-panel">
              <h1 class="page-title">Категории товаров</h1>
          </div>
          <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
          <div data-element="categoriesContainer"> </div>
      </div>
        
      `;
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

  renderComponents(){
        
    Object.keys(this.components).forEach(componentName =>{

      const root = this.subElements[componentName];
      
      const {element} = this.components[componentName];
  
      root.replaceWith(element);
      
    })
  }

  destroy() {

    Object.keys(this.components).forEach(componentName =>{
      const element = this.components[componentName];
      element.destroy();
    });
    this.remove
    this.subElements = {};
    this.components = {};
  }

}