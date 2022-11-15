import ProductForm from '../../../components/product-form';
import NotificationMessage from '../../../components/notification';

export default class Page {
  element;
  subElements = {};
  components = [];
  productId;

  constructor(productId = '') {
    this.productId = productId[1];
  }

  get template() {
    return `<div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">
              Products
            </a>
            / ${this.productId ? 'Edit' : 'Add'}
          </h1>
        </div>
        <!-- ProductForm component -->
        <div class="content-box" data-element="productContainer">
        </div>
      </div>`;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    await this.renderComponents();

    this.element.addEventListener("product-updated", this.productUpdated);
    this.element.addEventListener("product-saved", this.productSaved);

    return this.element;
  }

  productUpdated = () => {
    const notificaion = new NotificationMessage('Product was updated');        
    notificaion.show();
  };

  productSaved = async (event) => {
    const notificaion = new NotificationMessage('Product was saved');        
    notificaion.show();
    const {id} = event.detail;
    this.productId = id;
    history.replaceState(null, null, `/products/${id}`); 
    //не удалось обновить содержимое страницы без перехода, методы вызываются, но содержимое страницы не меняется
    history.go(0);   
  };

  async renderComponents() {

    const newForm = new ProductForm(this.productId);
    await newForm.render();

    this.subElements.productContainer.append(newForm.element);
    this.components.push(newForm);
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
    for (const component of this.components) {
      component.destroy();
    }
  }

}