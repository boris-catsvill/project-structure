import fetchJson from './utils/fetch-json.js';
import escapeHtml from './utils/escape-html.js';


const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
    element;
    subElements;
    defaultFormData = [{
        title: '',
        description: '',
        quantity: 1,
        subcategory: '',
        status: 1,
        images: [],
        price: 100,
        discount: 0
    }];
    data;
    categories;
    formData;

    onSubmit = (event) => {
        event.preventDefault();
        this.save()
    }

    uploadImage = () => {
        const fileInput = document.createElement('input');

        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.addEventListener('change', async () => {
            const [file] = fileInput.files;

            if (file) {
                const formData = new FormData();
                const { uploadImage, imageListContainer } = this.subElements;

                formData.append('image', file);

                uploadImage.classList.add('is-loading');
                uploadImage.disabled = true;

                const result = await fetchJson('https://api.imgur.com/3/image', {
                    method: 'POST',
                    headers: {
                        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
                    },
                    body: formData,
                    referrer: ''
                });

                imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name));

                uploadImage.classList.remove('is-loading');
                uploadImage.disabled = false;

                // Remove input from body
                fileInput.remove();
            }
        });

        // must be in body for IE
        fileInput.hidden = true;
        document.body.append(fileInput);

        fileInput.click();
    };

    constructor(productId = '') {
        this.productId = productId
    }

    async render() {
        const categoryPromise = this.loadCategories();

        const productPromise = this.productId
            ? this.loadProductData(this.productId)
            : Promise.resolve(this.defaultFormData);

        const [categoryData, productResponse] = await Promise.all([categoryPromise, productPromise]);
        const [productData] = productResponse;

        this.formData = productData;
        this.categories = categoryData;
        return this.renderForm();

    }

    renderForm() {
        const element = document.createElement('div');
        element.innerHTML = this.formData
            ? this.getFormTemplate(this.formData)
            : this.getEmptyTemplate();
        this.element = element.firstElementChild;
        this.subElements = this.getSubElements();
        this.initEventListeners();

        return element;
    }

    getEmptyTemplate () {
        return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
    }


    loadCategories() {
        return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);

    }

    loadProductData(productId) {
        return fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
    }

    getFormTemplate(data = {}) {
        return `
            <div class="product-form">
                <form data-element="productForm" class="form-grid">
                    ${this.createFormTitle(data)}
                    ${this.createFormDescription(data)}
                    ${this.createImageListContainer(data)}
                    ${this.createCategoriesElement(this.categories)}
                    ${this.createPriceAndDiscount(data)}
                    ${this.createQuantity(data)}
                    ${this.createStatus(data)}
                    <div class="form-buttons">
                        <button type="submit" name="save" class="button-primary-outline">
                           ${this.productId ? "Сохранить" : "Добавить"} товар
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    createFormTitle(data) {
        return `
                  <div class="form-group form-group__half_left">
                    <fieldset>
                      <label class="form-label">Название товара</label>
                      <input
                          id="title"
                          required=""
                          type="text"
                          name="title"
                          class="form-control"
                          placeholder="Название товара"
                          data-element="title"
                          value="${data.title ? escapeHtml(data.title) : ''}">
                    </fieldset>
                  </div>
        `;
    }

    createFormDescription(data) {
        return `
         <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" id="description" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${data.description ? data.description : ''}</textarea>
        </div>
        `;
    }

    createCategoriesElement(categories, data = {}) {
        return `
              <div class="form-group form-group__half_left">
                <label
                    class="form-label">Категория</label>
                    ${this.fillOptions(categories, data)}
              </div>
        `;
    }

    fillOptions(categories, data) {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

        const select = wrapper.firstElementChild;

        for (const category of this.categories) {
            for (const child of category.subcategories) {
                select.append(new Option(`${category.title} > ${child.title}`, child.id));
            }
        }

        return select.outerHTML;
    }

    //the method is not finished, it needs to be finalized
    createImageListContainer(data) {
        const {images} = data;
        return `
        <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            <ul class="sortable-list">
               ${this.getImageList(images)}
            </ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage">
                <span>Загрузить</span>
            </button>
        </div>
        `
    }

    getImageList(data = []) {
        if (!data.length) {
            return '';
        } else {
            return data.map(item => {
                const {url, source} = item;
                return `
                 <li class="products-edit__imagelist-item sortable-list__item" style="">
                    <input type="hidden" name="url" value="${url}">
                    <input type="hidden" name="source" value="${source}">
                    <span>
                        <img src="../assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
                        <img class="sortable-table__cell-img" alt="Image" src="${url}">
                        <span>${source}</span>
                    </span>
                    <button type="button">
                        <img src="../assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
                    </button>
                </li>
                `;
            }).join('');
        }
    }

    getImageItem (url, name) {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

        return wrapper.firstElementChild;
    }
    createPriceAndDiscount(data) {
        return `
        <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input
                id="price"
                required=""
                type="number"
                name="price"
                class="form-control"
                placeholder="100"
                data-element="price"
                value="${data.price ? data.price : ''}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input
                id="discount"
                required=""
                type="number"
                name="discount"
                class="form-control"
                placeholder="0"
                data-element="discount"
                value="${data.price ? data.discount : ''}">
            </fieldset>
        </div>
        `;
    }

    createQuantity(data) {
        return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="quantity" id="" type="number" class="form-control" name="quantity" placeholder="1" value="${data.quantity}">
      </div>
        `;
    }

    createStatus(data) {
        return `
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
        `;
    }

    getSubElements() {
        const subElements = this.element.querySelectorAll('[data-element]');
        return [...subElements].reduce((accum, item) => {
            accum[item.dataset.element] = item;
            return accum;
        }, {});
    }

    getFormData () {
        const { productForm, imageListContainer } = this.subElements;
        const excludedFields = ['images'];
        const formatToNumber = ['price', 'quantity', 'discount', 'status'];
        const [defaultFormData] = this.defaultFormData;
        const fields = Object.keys(defaultFormData).filter(item => !excludedFields.includes(item));
        const getValue = field => productForm.querySelector(`[name=${field}]`).value;
        const values = {};

        for (const field of fields) {
            const value = getValue(field);

            values[field] = formatToNumber.includes(field)
                ? parseInt(value)
                : value;
        }
        const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

        values.images = [];
        values.id = this.productId;

        for (const image of imagesHTMLCollection) {
            values.images.push({
                url: image.src,
                source: image.alt
            });
        }

        return values;
    }

    initEventListeners () {
        const { productForm, uploadImage, imageListContainer } = this.subElements;
        productForm.addEventListener('submit', this.onSubmit);
        uploadImage.addEventListener('click', this.uploadImage);

        imageListContainer.addEventListener('click', event => {
            if ('deleteHandle' in event.target.dataset) {
                event.target.closest('li').remove();
            }
        });
    }
    destroy () {
        this.remove();
        this.element = null;
        this.subElements = null;
    }

    remove () {
        if (this.element) {
            this.element.remove();
        }
    }

    async save() {
        const formData = this.getFormData();

        try{
            const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
                method:this.productId ? 'PATCH': 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            this.dispatchEvent(result.id);
        }catch (e) {
            console.error('some error', e);
        }
    }
    dispatchEvent(id) {
        const event = this.productId
            ? new CustomEvent('product-updated', {detail:id})
            : new CustomEvent('product-saved');

        this.element.dispatchEvent(event);
    }
}
