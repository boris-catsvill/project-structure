import ProductForm from "../../../components/product-form/index.js"

export default class Page {
	element;
	components = {};
	type = 'Add'

	onRoute = (event) => {
		const { match } = event.detail;

		if (match.length > 1) {
			this.productId = match[1];
			this.type = 'Edit';
		}
		this.update();

	}

	constructor(productId = "") {
		this.productId = productId;

		this.initEventListeners();
	}

	initialize() {
		const productForm = new ProductForm(this.productId);

		this.components.productForm = productForm;
	}

	initEventListeners() {
		document.addEventListener("route", this.onRoute);
	}

	template() {
		return `
      <div class="products-edit">
        <div class="content__top-panel">
          <h1 class="page-title">
            <a href="/products" class="link">Products</a> / ${this.type}
          </h1>
        </div>
        <div class="content-box">
        </div>
      </div>    
    `;
	}

	async render() {
		const element = document.createElement("div");

		element.innerHTML = this.template();

		this.initialize();

		const productFormElement = await this.components.productForm.render();

		const content = element.querySelector('.content-box');

		content.append(productFormElement);

		this.element = element;

		return this.element;
	}

	async update() {
		this.remove(this.element.firstElementChild);
		this.components.productForm.destroy();

		this.element.append(await this.render())
	}

	remove(element = this.element) {
		element.remove();
	}

	destroy() {
		this.remove();
		this.element = null;
		document.removeEventListener("route", this.onRoute);
		this.components.productForm.destroy();

	}
}