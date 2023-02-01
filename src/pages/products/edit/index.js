import ProductForm from "../../../components/product-form";
import NotificationMessage from "../../../components/notification";

export default class Page {
	element;
	subElements = {};
	components = {};

	constructor(productId = '') {
		this.productId = productId;
	}

	getTemplate() {
		return `
			<div class="products-edit">
				<div class="content__top-panel">
					<h1 class="page-title">
						<a href="/products" class="link">Товары</a>
						/ ${this.productId ? 'Редактировать' : 'Добавить'}
					</h1>
				</div>
				<div class="content-box"></div>
			</div>
		`;
	}

	async render() {
		const element = document.createElement('div');

		element.innerHTML = this.getTemplate();

		this.element = element.firstElementChild;

		await this.initComponents(this.productId);
		this.renderComponents();
		this.initEventListeners();

		return this.element;
	}

	async initComponents(productId = '') {
		const productData = await new ProductForm(productId);
		const productForm = await productData.render();

		this.components = {
			productForm
		}
	}

	renderComponents() {
		const contentBox = this.element.querySelector('.content-box');

		contentBox.append(this.components.productForm); 
	}

	initEventListeners() {
		this.productId
			? this.components.productForm.addEventListener('product-updated', event => this.showNotification('Продукт обновлён', event))
			: this.components.productForm.addEventListener('product-saved', event => this.showNotification('Продукт добавлен', event));
	}

	showNotification(string, event) {
		console.log(event)

		const notification = new NotificationMessage(string, {
			duration: 2000,
			type: 'success'
		});

		notification.show();
	}
}