import ProductForm from '../../../components/product-form/index.js';
import NotificationMessage from '../../../components/notification/index.js';

export default class Page {
    element;
    subElements = {};
    components = {};

    async render() {
        const pathname = decodeURI(window.location.pathname).replace(/^\/|\/$/, '');
        const productId = pathname.split('/')[1];

        let productForm;

        if (productId && productId !== 'add') {
            productForm = new ProductForm(productId);
        } else {
            productForm = new ProductForm();
        }

        const renderForm = async () => {
            await productForm.render();

            productForm.element.addEventListener('product-saved', event => {
                const notification = new NotificationMessage('Product Created');
                notification.show();
            });

            productForm.element.addEventListener('product-updated', event => {
                const notification = new NotificationMessage('Product Updated');
                notification.show();
            });

            const element = document.createElement('div');

            element.innerHTML = `
                <div class="products-edit">
                    <div class="content__top-panel">
                        <h1 class="page-title">
                            <a href="/products" class="link">Товары</a> / ${productId !== 'add' ? 'Редактировать' : 'ADD'}
                        </h1>
                    </div>
                    <div class="content-box">
                        <div class="product-form"></div>
                    </div>
                </div>`;

            element.querySelector('.product-form').append(productForm.element);

            return element;
        }

        return renderForm();
    }
}
