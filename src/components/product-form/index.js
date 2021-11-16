import SortableList from '@/components/sortable-list/index.js';
import escapeHtml from '@/utils/escape-html.js';
import fetchJson from '@/utils/fetch-json.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  element;
  subElements = {};
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

  onSubmit = event => {
    event.preventDefault();

    this.save();
  }

  onUploadImage = () => {
    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';

    input.addEventListener('change', async () => {
      const [file] = input.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        try {
          const result = await fetchJson('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
            },
            body: formData
          });
          const wrapper = document.createElement('div');

          wrapper.innerHTML = this.getImageItem(result.data.link, file.name);

          imageListContainer.firstElementChild.append(wrapper.firstElementChild);
        } catch (error) {
          console.error('Image upload', error);
        } finally {
          uploadImage.classList.remove('is-loading');
          uploadImage.disabled = false;

          input.remove();
        }
      }
    });

    input.hidden = true;
    document.body.append(input);

    input.click();
  }

  onDeleteImage = event => {
    if (event.target.closest('[data-delete-handle]')) {
      event.preventDefault();

      event.target.closest('li').remove();
    }
  }

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    await this.loadData();

    this.renderForm();

    if (this.formData) {
      this.setFormData();
      this.createImagesList();
      this.initEventListeners();
    }

    return this.element;
  }

  renderForm() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.formData ? this.template : this.emptyTemplate;

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(wrapper);
  }

  get template() {
    return `
      <div class="product-form">
        <form class="form-grid" data-element="productForm">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Product name</label>
              <input
                id="title"
                type="text"
                name="title"
                class="form-control"
                placeholder="Product name"
                required
              >
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Description</label>
            <textarea
              id="description"
              class="form-control"
              name="description"
              data-element="productDescription"
              placeholder="Product description"
              required
            ></textarea>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Photo</label>
            <div data-element="imageListContainer"></div>
            <button data-element="uploadImage" type="button" class="button-primary-outline fit-content">
              <span>Download</span>
            </button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Category</label>
            ${this.createCategoriesSelect()}
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Price ($)</label>
              <input
                id="price"
                type="number"
                name="price"
                class="form-control"
                placeholder="${this.defaultFormData.price}"
                required
              >
            </fieldset>

            <fieldset>
              <label class="form-label">Discount ($)</label>
              <input
                id="discount"
                type="number"
                name="discount"
                class="form-control"
                placeholder="${this.defaultFormData.discount}"
                required
              >
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Quantity</label>
            <input
              id="quantity"
              type="number"
              class="form-control"
              name="quantity"
              placeholder="${this.defaultFormData.quantity}"
              required
            >
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Status</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? 'Save' : 'Add'} product
            </button>
          </div>
        </form>
      </div>
    `;
  }

  get emptyTemplate() {
    return `
      <div class="product-form">
        <h2 class="page-title">Page not found</h2>
        <p>Sorry, this item does not exist.</p>
      </div>
    `;
  }

  async loadData() {
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId ? this.loadProduct() : [this.defaultFormData];

    const [categoriesData, productData] = await Promise.all([categoriesPromise, productPromise]);

    this.formData = productData[0];
    this.categories = categoriesData;
  }

  loadProduct() {
    return fetchJson(`${BACKEND_URL}api/rest/products?id=${this.productId}`);
  }

  loadCategories() {
    return fetchJson(`${BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const values = {};

    for (const field of fields) {
      const value = productForm.elements[field].value;

      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    values.images = [];
    values.id = this.productId;

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  setFormData() {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));

    fields.forEach(field => {
      const element = productForm.elements[field];

      element.value = this.formData[field];

      if (field === 'subcategory' && !this.formData[field]) {
        element.selectedIndex = 0;
      }
    });
  }

  dispatchEvent(id) {
    const type = this.productId ? 'product-updated' : 'product-saved';

    this.element.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: id }));
  }

  createCategoriesSelect() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select id="subcategory" class="form-control" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const subcategory of category.subcategories) {
        select.append(new Option(`${category.title} > ${subcategory.title}`, subcategory.id));
      }
    }

    return select.outerHTML;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  createImagesList() {
    const { imageListContainer } = this.subElements;
    const sortableList = new SortableList({
      items: this.formData.images.map(({ url, source }) => {
        const wrapper = document.createElement('div');

        wrapper.innerHTML = this.getImageItem(url, source);

        return wrapper.firstElementChild;
      })
    });

    imageListContainer.append(sortableList.element);
  }

  getImageItem(url, name) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="/icons/icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="/icons/icon-trash.svg" data-delete-handle alt="delete">
        </button>
      </li>`;
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('Product save', error);
    }
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.onUploadImage);
    imageListContainer.addEventListener('click', this.onDeleteImage);
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

