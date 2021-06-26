import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js';

export default class Page {
    element;
    subElements = {};
    components = {};

    constructor(match) {
        if (match)
            this.productId = match[match.length - 1] != "products/add" ? match[match.length - 1] : undefined;
    }

    get template() {
        return `
            <div class="products-edit">
                <div class="content__top-panel">
                    <h1 class="page-title">
                        <a href="/products" class="link">Товары</a> / Редактировать
                    </h1>
                </div>
                <div data-element="formEdit" class="content-box">
                    
                </div>
            </div>
        `;
    }
    
    initComponents() {
        const productForm = new ProductForm(this.productId);
        this.components.productForm = productForm;
    }

    async renderComponents() {
        const {productForm} = this.components;

        await productForm.render();
        this.subElements.formEdit.append(productForm.element);
    }

    async render() {
        const element = document.createElement('div');

        element.innerHTML = this.template;

        this.element = element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        await this.renderComponents();
        this.initEventListeners();
        
        return this.element;
    }

    initEventListeners () {
        this.components.productForm.element.addEventListener("product-saved", event => {
            const notification = new NotificationMessage("Товар добавлен");
            notification.show();
        });
      
        this.components.productForm.element.addEventListener("product-updated", event => {
            const notification = new NotificationMessage("Товар сохранен");
            notification.show();
        })
          
    }
        
    getSubElements (element) {
        const elements = element.querySelectorAll('[data-element]');
    
        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;
    
            return accum;
        }, {});
    }
    
    destroy() {
        for (const component of Object.values(this.components)) {
            component.destroy();
        }
    }
}