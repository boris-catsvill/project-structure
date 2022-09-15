import ProductForm from '../../../components/product-form/index';


export default class Page {

  components = {};

  constructor() {
    this.id = history.state ? history.state.id : null; 
  }

  async render() {
    const element = document.createElement('div');

    this.element = element;


    const productForm = new ProductForm(this.id);

    await productForm.render();

    element.append(productForm.element);
    this.element = element.firstElementChild;
    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove()
    this.element = null;
  }

}
