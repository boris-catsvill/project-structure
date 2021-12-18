import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import ImageUploader from '../../utils/image_uploader.js';
import SortableList from '../sortable-list/index.js';

export default class ProductForm {
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor(productId) {
    this.productId = productId;
    this.subElements = {};
  }

  getTemplate() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Product name</label>
            <input required
                   id="title"
                   value=""
                   type="text"
                   name="title"
                   class="form-control"
                   placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Description</label>
          <textarea required
                    id="description"
                    class="form-control"
                    name="description"
                    data-element="productDescription"
                    placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Image</label>
          <ul class="sortable-list" data-element="imageListContainer"></ul>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Download</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Category</label>
          ${this.getSelects()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Price ($)</label>
            <input required
                   id="price"
                   value=""
                   type="number"
                   name="price"
                   class="form-control"
                   placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Sale ($)</label>
            <input required
                   id="discount"
                   value=""
                   type="number"
                   name="discount"
                   class="form-control"
                   placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Quantity</label>
          <input required
                 id="quantity"
                 value=""
                 type="number"
                 class="form-control"
                 name="quantity"
                 placeholder="${this.defaultFormData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Active</option>
            <option value="0">Inactive</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? "Save" : "Add"} product
          </button>
        </div>
      </form>
    </div>
    `
  }

  getSelects() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;
    const select = wrapper.firstElementChild;
    for (const category of this.categories) {
      category.subcategories.forEach(sub =>
        select.append(new Option(`${category.title} > ${sub.title}`, sub.id))
      )}
    return select.outerHTML;
  }

  async render() {
    const categoriesPath = new URL('api/rest/categories', process.env.BACKEND_URL);
    categoriesPath.searchParams.set('_sort', 'weight');
    categoriesPath.searchParams.set('_refs', 'subcategory');
    const fetchCategories = fetchJson(categoriesPath);
    let fetchProduct;
    if (this.productId) {
      fetchProduct = fetchJson(`${process.env.BACKEND_URL}api/rest/products?id=${this.productId}`);
    } else {
      fetchProduct = new Promise((resolve) => resolve([this.defaultFormData]));
    }
    let [categories, products] = await Promise.all([fetchCategories, fetchProduct]);
    const [productData] = products;
    this.categories = categories;
    this.productData = productData;
    this.renderSkeleton();
    if (this.productData) {
      const ignoredField = ['images',];
      const productForm = this.subElements.productForm;
      const fields = Object.keys(this.defaultFormData).filter(item => !ignoredField.includes(item));
      for (const field of fields) {
        const element = productForm.querySelector(`#${field}`);
        element.value = this.productData[field] || this.defaultFormData[field];
      }
      this.attachEventListeners();
    }
    return this.element;
  }

  renderSkeleton() {
    const wrapper = document.createElement('div');
    if (this.productData) {
      wrapper.innerHTML = this.getTemplate()
    } else {
      wrapper.innerHTML = this.nothingFoundTemplate();
    }
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.getImages();
  }

  nothingFoundTemplate() {
    return `
    <div>
      <h1 class="page-title">Page not found</h1>
      <p>No products found</p>
    </div>
`}

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');
    for (const element of elements) {
      subElements[element.dataset.element] = element;
    }
    return subElements;
  }

  async save() {
    const product = this.getFormData();
    try {
      const result = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('something went wrong', error);
    }
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const ignoredField = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !ignoredField.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};
    for (const field of fields) {
      const value = getValue(field);
      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }
    const images = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    values.images = [];
    values.id = this.productId;
    for (const image of images) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }
    return values;
  }

  dispatchEvent(id) {
    let customizedEvent;
    if (this.productId) {
      customizedEvent = new CustomEvent('product-updated', { detail: id })
    } else {
      customizedEvent = new CustomEvent('product-saved')
    }
    this.element.dispatchEvent(customizedEvent);
  }

  getImages() {
    const { imageListContainer }  = this.subElements;
    const { images } = this.productData;
    const items = images.map(({url, source}) => this.getImageItem(url, source));
    const sortableList = new SortableList({ items });
    imageListContainer.append(sortableList.element);
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="/assets/icons/icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;
    return wrapper.firstElementChild;
  }

  submitHandler = event => {
    event.preventDefault();
    this.save();
  };

  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    const { uploadImage, imageListContainer } = this.subElements;
    fileInput.addEventListener('change', async () => {
      const imageLoader = new ImageUploader();
      try {
        const [file] = fileInput.files;
        const result = await imageLoader.upload(file);
        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;
        imageListContainer.append(this.getImageItem(result.data.link, file.name));
        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;
        fileInput.remove();
      } catch(error) {
        console.error('something went wrong', error);
      }
    })
    fileInput.hidden = true;
    document.body.append(fileInput);
    fileInput.click();
  };

  attachEventListeners() {
    const { productForm, uploadImage} = this.subElements;
    productForm.addEventListener('submit', this.submitHandler);
    uploadImage.addEventListener('click', this.uploadImage);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
