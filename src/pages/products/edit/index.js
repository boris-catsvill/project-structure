import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";

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
	
	get productFromUrl() {
		const pathArray = window.location.pathname.split('/');
		const product = pathArray.slice(-1)[0];
		
		if (product === "add" ) return null;
		
		return product;		
	}
	
	initComponents() {
		console.log("this.product: ", this.productFromUrl);
    this.components.productFrom = new ProductForm(this.productFromUrl);
  }

  async renderComponents() {
    const element = await this.components.productFrom.render();

		
		element.addEventListener('product-saved', (event) => {
			const notification = new NotificationMessage('Товар добавлен', {
				duration: 2000,
				type: 'success'
			});
			notification.show(element);
		});
		
		element.addEventListener('product-updated', (event) => {
			const notification = new NotificationMessage('Товар сохранен', {
				duration: 2000,
				type: 'success'
			});
			notification.show(element);
		});
		
		
    this.element.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
