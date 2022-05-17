import ProductForm from '../../../components/product-form/index';


export default class Page {

  components = {};

  constructor() {
    this.id = history.state?.id ?? null;
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

  // async render() {
  //   const element = document.createElement('div');
  //   this.element = element;


  //   this.initComponents();
  //   await this.renderComponents();

  //   return this.element;
  // }

  // initComponents() {
  //   this.components.productForm = new ProductForm(this.id);
  //   console.log(this.components);
  // }

  // async renderComponents() {
  //   const element = await this.components.productForm.render();
  //   console.log(element); // undefined
  //   this.element.append(element);
  // }


}
