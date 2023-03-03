import ProductForm from "../../../components/product-form";


export default class Page {
  element;
  subElements = {};
  components = {};

  constructor(match){
    this.match = {...match};
    this.productID = this.match[1]
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;


    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  getTemplate(){
    return `
      <div class="product-edit" >
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / ${ this.productID ? 'Редактировать' : 'Добавить'} 
          </h1>
        </div>
      </div>
    `

  }

  initComponents() {
   
    this.components.productFrom = new ProductForm(this.productID);
  }

  async renderComponents() {
    
    const element = document.createElement('div');
    element.classList.add('content-box');

    const productForm = await this.components.productFrom.render();
    element.append(productForm);

    this.element.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
