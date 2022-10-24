import ProductForm from "../../../components/product-form/index.js"

export default class Page {
  element;
  components = {};

  onRoute = (event) => {
    const {match} = event.detail;
      if (match.length > 1) {
        this.productId = match[1];
      }
      this.update();

  }

  constructor(productId = ""){
    this.productId = productId;

    this.initEventListeners();
  }

  initialize(){
    const productForm = new ProductForm(this.productId);

    this.components.productForm = productForm;

  }

  initEventListeners(){
    document.addEventListener("route", this.onRoute);
  }

  async render() {
    const element = document.createElement("div");

    this.initialize();


    const productFormElement = await this.components.productForm.render();

    element.append(productFormElement);
    this.element = element;


    return this.element;
  }

  async update(){
    this.remove(this.element.firstElementChild);
    this.components.productForm.destroy();

    this.element.append(await this.render())
  }

  remove(element = this.element){
    element.remove();
  }

  destroy(){
    this.remove();
    this.element = null;
    document.removeEventListener("route", this.onRoute);
    this.components.productForm.destroy();
    
  }
}
