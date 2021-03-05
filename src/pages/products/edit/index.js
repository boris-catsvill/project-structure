import ProductForm from "../../../components/product-form"

export default class Page {
	element;
	subElements = {};
	components = {};
	productId;

	initComponents() {
		this.components.productForm = new ProductForm(this.productId);
	}

	async render() {
		const pathname = window.location.pathname;
		if (!pathname.endsWith('/add')) {
			this.productId = pathname.slice(pathname.lastIndexOf('/') + 1);
		}
		const element = document.createElement('div');
		element.innerHTML = this.template;
		this.element = element;
		this.subElements = this.getSubElements(this.element);
		this.initComponents();
		await this.renderComponents();
		return this.element;
	}

	get template() {
		return `
			<div class="content__top-panel">
			<h1 class="page-title">
				<a href="/products" class="link">Товары</a> / ${((this.productId) ? 'Редактировать' : 'Добавить')}
			</h1>
			</div>
			<div class="content-box">
				<div data-element="productForm"></div>
			</div>
		`;
	}
	async renderComponents() {
		this.subElements.productForm.append(await this.components.productForm.render());
	}
	getSubElements(element) {
		const elements = element.querySelectorAll('[data-element]');
		return [...elements].reduce((accum, item) => {
			accum[item.dataset.element] = item;
			return accum;
		}, {});
	}

	destroy() {
		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}