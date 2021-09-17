import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element = null;
  subElements = [];
  product = {};
  categories = {};
  defaultProduct = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  loadImage = event => {
    const loadImgButton = event.target;
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async event => {
      const [imgFile] = event.target.files;

      loadImgButton.classList.add('is-loading');

      const response = await this.uploadToImgur(imgFile);

      loadImgButton.classList.remove('is-loading');

      if (response && response.data) {
        const img = {
          source: imgFile.name,
          url: response.data.link
        };

        this.subElements.imageListContainer.firstElementChild.append(this.getImageElement(img));
      }
    };

    input.dispatchEvent(new MouseEvent("click"));
  };

  submit = event => {
    event.preventDefault();

    this.save();
  };

  constructor (productId = null) {
    this.productId = productId;
  }

  async switchFromAddToEdit(productId) {
    this.productId = productId;

    const data = await this.loadData(this.productId);
    this.product = data.product;

    this.subElements.saveButton.innerText = 'Edit product';
  }

  async render () {
    const data = await this.loadData(this.productId);

    this.product = data.product;
    this.categories = data.categories;
    this.defaultProduct.subcategory = this.categories[0].subcategories[0].id;

    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.product
      ? this.getForm()
      : this.getEmptyTemplate();

    this.element = wrapper.firstElementChild;

    if (this.product) {
      this.subElements = this.getSubElements(this.element);

      this.fillFormWithObject(this.subElements.productForm, this.product);
      this.setSortableImageList();

      this.initEventListeners();
    }

    return this.element;
  }

  initEventListeners() {
    const {productForm, imageListContainer} = this.subElements;

    productForm.addEventListener('submit', this.submit);
    productForm.elements.uploadImage.addEventListener('pointerdown', this.loadImage);
  }

  async save() {
    const { productForm } = this.subElements;

    let method = 'PUT';
    let event = 'product-saved';

    if (this.productId) {
      method = 'PATCH';
      event = 'product-edited';
    }

    this.fillObjectWithForm(this.product, productForm);

    try {
      const url = new URL('api/rest/products', BACKEND_URL);
      const params = {
        method: method,
        headers: {
          'Content-type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(this.product)
      };

      const response = await fetchJson(url.href, params);

      this.element.dispatchEvent(new CustomEvent(event, {
        bubbles: true,
        detail: { response: response }
      }));
    } catch (error) {
      console.log('error', error);
    }
  }

  async uploadToImgur(imgFile) {
    const headers = new Headers();
    headers.append("Authorization", `Client-ID ${IMGUR_CLIENT_ID}`);

    const formData = new FormData();
    formData.append('image', imgFile);

    const requestOptions = {
      method: 'POST',
      headers: headers,
      body: formData,
      redirect: 'follow'
    };

    try {
      return await fetchJson("https://api.imgur.com/3/image", requestOptions);
    } catch (error) {
      console.log('error', error);
    }
  }

  fillObjectWithForm(object, form) {
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultProduct).filter(field => !excludedFields.includes(field));
    const convertToInt = ['price', 'discount', 'quantity', 'status'];
    const imgHTMLCollection = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');

    fields.forEach(field => {
      object[field] = convertToInt.includes(field)
        ? parseInt(form.elements[field]['value'])
        : form.elements[field]['value'];
    });

    object.images = [...imgHTMLCollection].map(img => {
      return {
        source: img.alt,
        url: img.src
      };
    });

    if (this.productId) {
      object.id = this.productId;
    }
  }

  fillFormWithObject(form, object) {
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultProduct).filter(field => !excludedFields.includes(field));

    fields.forEach(field => {
      form.elements[field]['value'] = object[field] || this.defaultProduct[field];
    });
  }

  async loadData(id = null) {
    try {
      let [categories, [product]] = await Promise.all([
        this.getCategoriesPromise(),
        this.getProductDataPromise(id)
      ]);

      return {categories, product};
    } catch (err) {
      console.log(err);
    }
  }

  async getProductDataPromise(id) {
    if (id) {
      const productUrl = new URL('api/rest/products', BACKEND_URL);
      productUrl.searchParams.append('id', id);

      return fetchJson(productUrl.href);
    } else {
      return [this.defaultProduct];
    }
  }

  async getCategoriesPromise() {
    const categoriesUrl = new URL('api/rest/categories', BACKEND_URL);
    categoriesUrl.searchParams.append('_sort', 'weight');
    categoriesUrl.searchParams.append('_refs', 'subcategory');

    return fetchJson(categoriesUrl.href);
  }

  getCatSelectHTML() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.categories.map(category => {
      if (category.subcategories) {
        return category.subcategories.map(subcategory => {
          return `<option value="${subcategory.id}">${category.title} > ${subcategory.title}</option>`;
        }).join('');
      }
    }).join('');

    return wrapper.innerHTML;
  }

  setSortableImageList() {
    const items = this.product.images.map(image => {
      return this.getImageElement(image);
    });

    const sortableList = new SortableList({items});

    this.subElements.imageListContainer.append(sortableList.element);
  }

  getImageElement(image) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <span>
            <img src="/icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="${escapeHtml(image.source)}" src="${escapeHtml(image.url)}">
            <span>${escapeHtml(image.source)}</span>
        </span>
        <button type="button">
          <img src="/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  getForm() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Product name</label>
              <input id="title"
                    required=""
                    type="text"
                    name="title"
                    class="form-control"
                    placeholder="Product name">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Description</label>
            <textarea id="description"
                    required=""
                    class="form-control"
                    name="description"
                    data-element="productDescription"
                    placeholder="Product description">
            </textarea>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Image</label>

            <div data-element="imageListContainer"></div>

            <button type="button"
                    name="uploadImage"
                    class="button-primary-outline fit-content">
                <span>Upload</span>
             </button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Category</label>
            <select class="form-control" name="subcategory" id="subcategory">
                ${this.getCatSelectHTML()}
            </select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Price ($)</label>
              <input id="price"
                    equired=""
                    type="number"
                    name="price"
                    class="form-control"
                    placeholder="${this.defaultProduct.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Discount ($)</label>
              <input id="discount"
                    required=""
                    type="number"
                    name="discount"
                    class="form-control"
                    placeholder="${this.defaultProduct.discount}">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Quantity</label>
            <input id="quantity"
                    required=""
                    type="number"
                    class="form-control"
                    name="quantity"
                    placeholder="${this.defaultProduct.quantity}">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Status</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Active</option>
              <option value="0">Not active</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline" data-element="saveButton">
              ${this.productId ? 'Edit product' : 'Save product'}
            </button>
          </div>

        </form>
      </div>`;
  }

  getEmptyTemplate () {
    return `<div>
      <h1 class="page-title">Page not found</h1>
      <p>Sorry, this item does not exist.</p>
    </div>`;
  }

  getSubElements(element) {
    const subElements = Array.from(element.querySelectorAll('[data-element]'));

    return subElements.reduce((result, subElement) => {
      result[subElement.dataset.element] = subElement;

      return result;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = [];
    this.product = {};
  }
}
