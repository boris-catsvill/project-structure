import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson, {FetchError} from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  controlElements = {};

  formControlValues = {
    title: '',
    description: '',
    subcategory: '',
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1,
    images: [],
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = async (event) => {
      const [ fileImage ] = fileInput.files;
      if (!fileImage) return;

      const formData = new FormData();
      formData.append('image', fileImage);

      fileInput.disabled = true;

      try {
        const response = await fetchJson(`https://api.imgur.com/3/image`, {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
          referrer: ''
        })

        const imageObj = { url: response.data.link, source: fileImage.name };
        this.subElements.imageListContainer.firstElementChild.append(this.getImageListItem(imageObj));

      } catch(error) {

        this.element.dispatchEvent(new CustomEvent('network-error', {
          bubbles: true,
          detail: error.message
        }));
      }

      fileInput.disabled = false;
    }
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  }

  constructor (productId) {
    this.productId = productId;
    this.urlProducts = new URL('api/rest/products', BACKEND_URL);
    this.urlCategories = new URL('api/rest/categories', BACKEND_URL);

    this.getTemplate();
    this.getControlElements();
    this.getSubElements();
    this.addEventListeners();
  }

  async render () {
    await Promise.all([this.getCategoriesList(), this.getProductData()]);

    return this.element;
  }

  getTemplate() {
    let element = document.createElement('div');
    element.classList.add('product-form');
    element.innerHTML = `<form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Product name</label>
          <input required="" type="text" name="title" id="title" class="form-control" placeholder="Product name">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Description</label>
        <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Product description"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Image</label>
        <div data-element="imageListContainer"></div>
        <button type="button" name="uploadImage" class="button-primary-outline fit-content"><span>Upload</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Category</label>
        <select class="form-control" name="subcategory" id="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Price ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Discount ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Number</label>
        <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Status</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          ${this.productId ? "Save product" : "Add product"}
        </button>
      </div>
    </form>`;

    this.element = element;
  }

  getControlElements() {
    this.controlElements = Array.from(this.element.querySelectorAll(`.form-control`))
      .reduce((previous, current) => {
        previous[current.name] = current;
        return previous;
      }, {});
  }

  getSubElements() {
    this.subElements = [...this.element.querySelectorAll(`[data-element]`)]
      .reduce((previous, current) => {
        previous[current.dataset.element] = current;
        return previous;
      }, {});
  }

  addEventListeners() {
    this.element.querySelector(`[name="uploadImage"]`).addEventListener(`click`, this.uploadImage);
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
  }

  removeEventListeners() {
    this.element.querySelector(`[name="uploadImage"]`).removeEventListener(`click`, this.uploadImage);
    this.subElements.productForm.removeEventListener('submit', this.onSubmit);
  }

  dispatchEvent(id) {
    const event = this.productId ?
      new CustomEvent('product-updated', { detail: id }) :
      new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  dispatchEventError(message) {
    const event = new CustomEvent('network-error', { detail: message });

    this.element.dispatchEvent(event);
  }

  async loadProductData() {
    if (!this.productId) {
      return Promise.resolve([this.formControlValues]);
    }
    this.urlProducts.searchParams.set('id', this.productId);

    let result = [];

    try {
      result = await fetchJson(this.urlProducts);
    } catch(error) {

      this.element.dispatchEvent(new CustomEvent('network-error', {
        bubbles: true,
        detail: error.message
      }));
    }

    return result;
  }

  async getProductData() {
    const data = await this.loadProductData();

    if (!data || !Array.isArray(data) || data.length === 0) return;

    for (const key of Object.keys(this.formControlValues)) {
      if (key === 'images') {
        this.subElements.imageListContainer.append(this.getImageList(data[0].images));
      } else {
        this.controlElements[key].value = data[0][key];
      }
      this.formControlValues[key] = data[0][key];
    }
  }

  async loadCategoriesData() {
    this.urlCategories.searchParams.set('_sort', `weight`);
    this.urlCategories.searchParams.set('_refs', `subcategory`);

    const categoriesData = [];

    try {
      const data = await fetchJson(this.urlCategories);

      data.forEach( category => {
        categoriesData.push(...category.subcategories.map( sub => {
          return { value: sub.id, content: `${category.title} &gt; ${sub.title}` };
        }));
      });
    } catch(error) {

      this.element.dispatchEvent(new CustomEvent('network-error', {
        bubbles: true,
        detail: error.message
      }));
    }

    return categoriesData;
  }

  async getCategoriesList() {
    const categoriesData = await this.loadCategoriesData();

    if (categoriesData.length === 0) return;

    this.controlElements.subcategory.innerHTML = categoriesData.map( item => {
      return `<option value="${item.value}">${item.content}</option>`;
    }).join('');

    this.controlElements.subcategory.value = this.formControlValues.subcategory
      ? this.formControlValues.subcategory
      : this.controlElements.subcategory.firstElementChild.value;
  }

  getImageList(images) {
    const imageList = images.map(image => this.getImageListItem(image));
    this.sortableList = new SortableList({ items: imageList });

    return this.sortableList.element;
  }

  getImageListItem(item) {
    let wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">

        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
          <span>${item.source}</span>
        </span>

        <button type="button" name="deleteImage">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  getFormData() {
    const formData = {};

    if (this.productId) {
      formData['id'] = this.productId;
    }

    for (const key of Object.keys(this.controlElements)) {
      const ref = this.controlElements[key];
      formData[key] = (ref.type === 'number' || ref.name === 'status') ?
        parseInt(ref.value) : ref.value;
    }

    formData['images'] = [...this.element.querySelectorAll('.sortable-list__item')]
      .map(item => {
        return {
          url: item.children[0].value,
          source: item.children[1].value,
        };
      });

    console.log(formData['images']);

    return formData;
  }

  async save() {
    const formData = this.getFormData();

    try {
      const response = await fetchJson(this.urlProducts, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
      })

      this.dispatchEvent(response.id);

    } catch(error) {

      this.element.dispatchEvent(new CustomEvent('network-error', {
        bubbles: true,
        detail: error.message
      }));

    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
  }
}
