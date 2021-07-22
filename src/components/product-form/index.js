import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  imagesList = null;
  defaultProduct = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
    images: []
  };

  deleteImage = (event) => {
    const item = event.currentTarget.closest('.products-edit__imagelist-item');
    if (item) {
      item.remove();
    }
  };

  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  };

  handleImageUpload = (event) => {
    event.preventDefault();
    const tempFileUpload = document.createElement('input');

    tempFileUpload.type = 'file';
    tempFileUpload.accept = 'image/*';
    tempFileUpload.hidden = true;

    document.body.append(tempFileUpload);
    tempFileUpload.click();

    tempFileUpload.onchange = e => {
      e.preventDefault();
      const [file] = tempFileUpload.files;
      if (file) {
        const data = new FormData();
        const { name } = file;
        const { uploadImage } = this.subElements;

        data.append('image', file);
        uploadImage.classList.add('is-loading');

        this.imageUploadRequest(data)
          .then(resp => {
            const newImage = document.createElement('li');
            newImage.className = 'products-edit__imagelist-item';
            newImage.innerHTML = this.renderImage({url: resp.data.link, source: name});
            this.imagesList.addItem(newImage);
          })
          .catch(console.error)
          .finally(() => {
            tempFileUpload.remove();
            uploadImage.classList.remove('is-loading');
          });
      }
    };
  };

  constructor (productId) {
    this.productId = productId;
    this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'product-form';

    const categoriesRequest = fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
    const productRequest =
      !!this.productId ?
        fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`)
        :
        [this.defaultProduct];

    Promise.all([categoriesRequest, productRequest])
      .then(([categories, productData]) => {
        const [product] = productData;
        this.renderElementContent(product, categories);
        this.getSubElements();
        this.renderImagesList(product.images);
        this.setFormValues(product);
        this.initEventListeners();
      })
      .catch(console.error);

    return this.element;
  }

  initEventListeners() {
    const { productForm, uploadImage } = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.handleImageUpload);
  }

  removeEventListeners() {
    const { productForm, imageListContainer, uploadImage } = this.subElements;
    const deleteButtons = imageListContainer.querySelectorAll('[data-delete-handle]');

    productForm.removeEventListener('submit', this.onSubmit);
    deleteButtons.forEach(btn => btn.removeEventListener('click', this.deleteImage));
    uploadImage.removeEventListener('click', this.handleImageUpload);
  }

  renderCategorySelect(categoriesList = []) {
    const list = [];

    categoriesList.forEach(category => {
      if (category.subcategories) {
        category.subcategories.forEach(
          subcategory => list.push({id: subcategory.id, title: subcategory.title, rootTitle: category.title})
        );
      }
    });

    const options = list.map(
      item => `<option value="${item.id}">${item.rootTitle} &gt; ${item.title}</option>`
    ).join('');

    return `
      <select class="form-control" name="subcategory" id="subcategory">
        ${options}
      </select>
    `;
  }

  renderElementContent(product = {}, categories = []) {
    this.element.innerHTML = `
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer"></div>
          <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.renderCategorySelect(categories)}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status" id="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
      <form data-element="imageUploadForm"></form>
    `;
  }

  setFormValues(product) {
    const {productForm} = this.subElements;
    const {elements} = productForm;
    const {title, description, subcategory, price, discount, quantity, status} = product;
    elements.title.value = title;
    elements.description.value = description;
    elements.subcategory.value = subcategory;
    elements.price.value = price;
    elements.discount.value = discount;
    elements.quantity.value = quantity;
    elements.status.value = status;
  }

  renderImage(data) {
    return `
        <input type="hidden" name="url" value="${data.url}">
        <input type="hidden" name="source" value="${data.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${data.url}">
          <span>${data.source}</span>
        </span>
        <button type="button" class="products-edit__remove-btn">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      `;
  }

  renderImagesList(images = []) {
    const imagesNodeList = images.map(image => {
      const li = document.createElement('li');
      li.classList.add('products-edit__imagelist-item');
      li.innerHTML = this.renderImage(image);

      return li;
    });
    this.imagesList = !!this.imagesList ? this.imagesList : new SortableList({items: imagesNodeList});
    this.subElements.imageListContainer.append(this.imagesList.element);
  }

  get requestData() {
    const { productForm } = this.subElements;
    const formData = new FormData(productForm);
    const result = {};
    const stringFields = ['description', 'title', 'subcategory'];
    const numericFields = ['price', 'status', 'discount', 'quantity'];
    const urls = formData.getAll('url');
    const sources = formData.getAll('source');

    stringFields.forEach(field => {
      result[field] = formData.get(field);
    });

    numericFields.forEach(field => {
      result[field] = parseFloat(formData.get(field));
    });

    result.images = urls.map((url, index) => ({ url, source: sources[index]}));

    return result;
  }

  async save() {
    const body = {...this.requestData};
    if (this.productId) {
      body.id = this.productId;
    }

    const method = this.productId ? 'PATCH' : 'PUT';
    const eventName = this.productId ? 'product-updated' : 'product-created';

    fetch(`${BACKEND_URL}/api/rest/products`, {method, body: JSON.stringify(body), headers: {"Content-Type": "application/json"}})
      .then(() => {
        this.element.dispatchEvent(new CustomEvent(eventName, {bubbles: true}));
      })
      .catch(console.error);
  }

  async imageUploadRequest(formData) {
    const params = {
      method: 'POST',
      headers: {Authorization: `Client-ID ${IMGUR_CLIENT_ID}`},
      body: formData,
      referrer: ''
    };

    return fetchJson('https://api.imgur.com/3/image', params);
  }

  getSubElements() {
    const subs = this.element.querySelectorAll('[data-element]');
    [...subs].forEach(sub => {
      const key = sub.dataset.element;
      this.subElements[key] = sub;
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeEventListeners();
    if (this.imagesList) {
      this.imagesList.destroy();
    }
    this.remove();
    this.subElements = {};
  }
}
