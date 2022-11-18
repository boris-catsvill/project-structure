import ProductForm from '../../../components/product-form/index.js';

export default class Page {
  element;
  productForm;

  constructor(productId = ""){
    this.productId = productId;
  }

  async render() {
    const element = document.createElement("div");
    this.productForm = new ProductForm(this.productId);
    const productFormElement = await this.productForm.render();
    element.append(productFormElement);
    this.element = element;
    return this.element;
  }

  async update(){
    this.remove();
    this.productForm.destroy();
    this.element.append(await this.render())
  }

  remove(){
    this.element?.remove();
  }

  destroy(){
    this.remove();
    this.element = null;
    this.productForm.destroy();
  }
}
