import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
export default class ProductForm {
    element;
    productData ={
        title: '',
        description: '',
        quantity: 1,
        subcategory: '',
        status: 1,
        price: '',
        discount: '',
        images: []
    };
    subcategory = [];
    subElements = [];

    constructor (productId) {
        this.productId = productId;
    }

    async render () {
        if(this.productId) {
            const [categoriesData, productData] = await Promise.all([this.loadCategory(), this.productLoadData()]);
            this.productData = productData[0];
            this.subcategory = categoriesData;
        } else {
            this.subcategory = await this.loadCategory();
        }

        const container = document.createElement('div');

        if (!this.productData) {
            container.innerHTML = `<div class="product-form" data-element="productForm">
                <h1 class="page-title">Страница не найдена</h1>
                <p>Извините, данный товар не существует</p>
            </div>`;

            this.element = container.firstElementChild;

            return this.element;
        }

        container.innerHTML = `<div class="product-form">
            <form data-element="productForm" class="form-grid">
                ${this.productName}
                ${this.productDescription}
                ${this.productPicture}
                ${this.productCategory}
                ${this.productPrice}
                ${this.productStock}
                ${this.productInventory}
                ${this.productSubmit}
            </form>
            <input name="fileInput" type="file" hidden>
        </div>`;

        this.element = container.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.productPictureItem();
        this.options();

        this.subElements.productForm.addEventListener('input', event => {
            if(event.target.type === 'number' || event.target.name === 'status' ) {
                this.productData[event.target.name] = Number(event.target.value);
            } else {
                this.productData[event.target.name] = event.target.value;
            }
        });

        this.element.querySelector('[data-element = "imageListContainer"]').addEventListener('click', event => {
            if (event.target.dataset.deleteHandle === '') {
                const currentImage = event.target.closest('li').firstElementChild.value;

                this.productData.images = this.productData.images.filter(item => item.url !== currentImage);
                this.productPictureItem();
            }
        });

        this.subElements['sortable-list-container'].querySelector('[name="uploadImage"]').addEventListener('click', event => {
            this.element.querySelector('[name="fileInput"]').click();
        });

        this.element.querySelector('[name="fileInput"]').addEventListener('change', async event => {
            const [file] = event.target.files;
            const formImage = new FormData();

            formImage.append('image', file);
            formImage.append('name', file.name);

            try {
                const response = await fetchJson('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: {
                        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
                    },
                    body: formImage,
                });

                this.productData.images.push({url: response.data.link, source: response.data.name});
                this.productPictureItem();

                event.target.value = "";
            } catch (err) {
                throw err;
            }
        });

        this.subElements.productForm.addEventListener('submit', event => {
            event.preventDefault();
            this.save();
        });

        return this.element;
    }

    getSubElements(element) {
        const elements = element.querySelectorAll('[data-element]');

        return [...elements].reduce((accum, subElement) => {
            accum[subElement.dataset.element] = subElement;

            return accum;
        }, {});
    }

    async save() {
            try {
                const response = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
                    method: this.productId ? 'PATCH' : 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.productData)
                });

                this.element.dispatchEvent(new CustomEvent('product-updated'));

            } catch(err) {
                throw err;
            }
    }

    async productLoadData() {
        return await fetchJson(process.env.BACKEND_URL + 'api/rest/products/?id=' + this.productId);
    }

    get productName() {
        return `<div class="form-group form-group__half_left">
            <fieldset>
                <label class="form-label">Название товара</label>
                <input required="" type="text" id="title" name="title" class="form-control" value='${this.productData.title}' placeholder="Название товара">
            </fieldset>
        </div>`;
    }

    get productDescription() {
        return `<div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара">${this.productData.description}</textarea>
        </div>`;
    }

    productPictureItem() {
        const pictureHTML = this.productData.images.map(item => {return `<li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value="${item.url}">
            <input type="hidden" name="source" value="${item.source}">
            <span>
                <img src="/icons/icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
                <span>${item.source}</span>
            </span>
            <button type="button">
                <img src="/icons/icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
        </li>`});

        this.element.querySelector('[data-element = "imageListContainer"]').innerHTML = `<ul class="sortable-list">
            ${pictureHTML.join('')}
        </ul>`;
    }

    get productPicture() {
        return `<div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline">
                <span>Загрузить</span>
            </button>
        </div>`;
    }

    get productCategory() {
        return `<div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" id="subcategory" name="subcategory"></select>
        </div>`;
    }

    get productPrice() {
        return `<div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" id="price" value='${this.productData.price}' class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" id="discount" value='${this.productData.discount}' class="form-control" placeholder="0">
            </fieldset>
        </div>`;
    }

    get productStock() {
        return `<div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" value='${this.productData.quantity}' id="quantity" placeholder="1">
        </div>`;
    }

    get productInventory() {
        return `<div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
            <option value="1" ${this.productData.status ? 'selected' : ''}>Активен</option>
            <option value="0" ${!this.productData.status ? 'selected' : ''}>Неактивен</option>
            </select>
        </div>`;
    }

    get productSubmit() {
        return `<div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
            ${this.productId? 'Сохранить товар' : 'Добавить Товар'}
            </button>
        </div>`;
    }

    linkAttributes(attr, path = this.url) {
        const url = new URL(path, globalUrl);

        for (const [key, value] of Object.entries(attr)) {
            url.searchParams.set(key, value);
        }

        return url.href;
    }

    async loadCategory() {
        return await fetchJson(process.env.BACKEND_URL + 'api/rest/categories?_sort=weight&_refs=subcategory');
    }

    options(){
        const options = [];

        for (const category of this.subcategory) {
            for (const child of category.subcategories) {
                options.push(`<option value=${child.id} ${child.id === this.productData.subcategory ? 'selected' : ''}>${category.title} > ${child.title}</option>`);
            }
        }

        this.subElements.productForm.elements.subcategory.insertAdjacentHTML('beforeend', options.join(''));
    }

    destroy() {
        this.remove();
        this.element = null;
        this.subElements = {};
    }

    remove() {
        this.element.remove();
    }
}