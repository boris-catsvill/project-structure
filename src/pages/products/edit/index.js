import ProductForm from "../../../components/product-form";

export default class Page {
  element;
  subElements = {};
  components = {};
	productId;
	
	
	constructor() {
		
	
	}
	

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <h1>Edit page</h1>
      </div>`;

    
			this.element = element.firstElementChild;

			this.initComponents();
			await this.renderComponents();
	
			return this.element;
  }
	
	get product() {
		const pathArray = window.location.pathname.split('/');
		return pathArray.slice(-1);
		
	}
	
	initComponents() {
		console.log("this.productId ", this.product);
    this.components.productFrom = new ProductForm(this.product);
  }

  async renderComponents() {
    const element = await this.components.productFrom.render();

    this.element.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
