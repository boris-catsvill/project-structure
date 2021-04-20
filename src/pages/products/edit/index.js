import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js';

export default class EditPage {
	element;
	subElements = {};
	components = {};
	currentId = '';

	getTemplate() {
		return `
      <div class="products-edit">
        <div class="content__top-panel">
        <h1 class="page-title">
            <a href="/products" class="link">Товары</a> / ${this.currentId ? "Редактировать" : "Добавить"} 
          </h1>
        </div>
        <div class="content-box">       
          <div data-element="productForm" class="product-form"></div>
        </div>
      </div>
    `;
	}

	get getId() {
		const { pathname } = location;

		return pathname.match(/products\/add/) ?
			"" :
			pathname.split('/products/')[1];
	}

	async render() {
		this.currentId = this.getId;

		const element = document.createElement('div');

		element.innerHTML = this.getTemplate();

		this.element = element.firstElementChild;

		this.subElements = this.getSubElements();

		await this.initComponents();

		const subElementsFields = Object.keys(this.subElements);

    for (const index in subElementsFields) {
      this.subElements[subElementsFields[index]].append(this.components[subElementsFields[index]].element);
    }

		this.initEventListeners();

		return this.element;
	}

	async initComponents() {
		const productForm = new ProductForm(this.currentId);
		await productForm.render();

		this.components = { productForm };
	}

	renderNotification(message) {
		const notification = new NotificationMessage(message);

		notification.show();
	}

	initEventListeners() {
		const { productForm } = this.components;

		productForm.element.addEventListener('product-saved', () => {
			this.renderNotification('Товар добавлен!');
		});

		productForm.element.addEventListener('product-updated', () => {
			this.renderNotification('Товар обновлен!');
		});
	}

	getSubElements(element) {
		const result = {};
		const elements = element.querySelectorAll('[data-element]');

		for (const subElement of elements) {
			const name = subElement.dataset.element;

			result[name] = subElement;
		}

		return result;
	}

	remove() {
		this.element.remove();
	}

	destroy() {
		this.remove();

		for (const component of Object.values(this.components)) {
			component.destroy();
		}
	}
}
