import SortableList from '../sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = process.env.BACKEND_URL;
const IMGUR_BACKEND_URL = 'https://api.imgur.com/3/image';
const API_URL_PRODUCTS = 'api/rest/products/';
const API_URL_CATEGORIES = 'api/rest/categories/';

class ImageInput {
  constructor(uploadImage, imageListContainer, imageTemplate) {

    this.uploadImage = uploadImage;
    this.imageListContainer = imageListContainer;
    this.imageTemplate = imageTemplate;

    this.initComponent();
    this.initEventListeners();
  }

  async loadImage(data) {
    return await fetchJson(`${IMGUR_BACKEND_URL}`, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: data,
    });
  }

  async addImageToImageList(file) {
    const formData = new FormData();

    formData.append('image', file);

    this.uploadImage.classList.add('is-loading');
    this.uploadImage.disabled = true;

    const result = await this.loadImage(formData);

    this.imageListContainer.insertAdjacentHTML('beforeend', this.imageTemplate(result.data.link, file.name));
  }

  initComponent() {
    this.element = document.createElement('input');

    this.element.type = 'file';
    this.element.accept = 'image/*';

    this.element.hidden = true;
  }

  initEventListeners() {
    this.element.addEventListener('change', async () => {
      const [file] = this.element.files;

      if (file) {
        this.addImageToImageList(file);

        this.destroy();
      }
    });
  }

  click() {
    this.element.click();
  }

  destroy() {
    this.element.remove();
  }
}

export default class ProductForm {
  constructor(productId = false) {
    this.productId = productId;

    this.defaultProductData = {
      id: "",
      characteristics: "",
      description: "",
      discount: 0,
      images: [],
      price: 100,
      quantity: 1,
      rating: 5,
      status: 1,
      subcategory: "",
    };

    this.initComponent();
    this.initEventListeners();
  }

  initComponent() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input data-element="title" id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            </div>
            <button type="button" data-element="uploadImage" name="uploadImage" class="button-primary-outline">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select data-element="subcategory" id ="subcategory" class="form-control" name="subcategory">
              
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input data-element="price" id="price" required="" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input data-element="discount" id="discount" equired="" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input data-element="quantity" id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select data-element="status" id="status" class="form-control" name="status">
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
      </div>
    `;
  }

  getSubcategoryListTemplate(value, text, defaultSelected, selected) {
    return new Option(text, value, defaultSelected, selected);
  }

  getProductImageTemplate(url, source) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;

    return wrapper.firstElementChild;
  }

  updateForm(data, categories) {
    const { description = "",
      discount = 0,
      images = [],
      price = 100,
      quantity = 1,
      status = 1,
      subcategory = "",
      title = "", } = data;

    this.subElements.title.value = title;

    this.subElements.productDescription.innerHTML = description;

    const sortableList = new SortableList({
      items: images.map(({ url = "", source = "" }) => {
        return this.getProductImageTemplate(url, source);
      })
    });

    this.subElements.imageListContainer.innerHTML = sortableList.element.outerHTML;

    this.subElements.price.value = price;

    this.subElements.discount.value = discount;

    this.subElements.quantity.value = quantity;

    const selectSubcategories = document.createElement('div');

    categories.forEach((category) => {
      category.subcategories.forEach((subcategoryItem) => {

        selectSubcategories.append(this.getSubcategoryListTemplate(
          subcategoryItem.id,
          `${category.title} > ${subcategoryItem.title}`,
          subcategory === subcategoryItem.id,
          subcategory === subcategoryItem.id));
      });
    });
    this.subElements.subcategory.innerHTML = selectSubcategories.innerHTML;

    this.subElements.status.value = status;
  }

  async render() {
    await this.loadData();
    this.updateForm(this.product, this.categories);

    return this.element;
  }

  async loadData() {
    const productPromise = this.productId ?
      this.getProducts(this.productId) :
      [this.defaultProductData];


    [this.categories, [this.product]] = await Promise.all([
      productPromise,
      this.getCategories(),
    ]);
  }

  async getCategories() {
    const url = new URL(`${BACKEND_URL}${API_URL_CATEGORIES}`);

    const params = {
      _sort: 'weight',
      _refs: 'subcategory',
    };

    url.search = new URLSearchParams(params).toString();

    return await fetchJson(url.toString());
  }

  async getProducts(productId) {
    const url = new URL(`${BACKEND_URL}${API_URL_PRODUCTS}`);

    const params = {
      id: productId,
    };

    url.search = new URLSearchParams(params).toString();

    return await fetchJson(url.toString());
  }

  async addProduct(product) {
    return await fetchJson(`${BACKEND_URL}${API_URL_PRODUCTS}`, {
      method: this.productId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(product),
    });
  }

  dispatchEvent(id) {
    const event = this.productId ?
      new CustomEvent("product-updated", { bubbles: true, detail: id }) :
      new CustomEvent("product-saved", { bubbles: true });

    this.element.dispatchEvent(event);
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await this.addProduct(product);

      this.dispatchEvent(result.id);
    } catch (error) {
      console.log(error);
    }
  }

  getImagesFormList() {
    const imagesList = this.subElements.imageListContainer.querySelectorAll('.sortable-list__item');

    return Array.from(imagesList).map(image => {
      const url = image.querySelector('[name="url"]');
      const source = image.querySelector('[name="source"]');

      return {
        url: url.value,
        source: source.value,
      };
    });
  }

  getFormData() {
    const product = this.product;

    const productResult = {};
    const fieldsProduct = Object.keys(product);

    for (const index in fieldsProduct) {
      const field = fieldsProduct[index];

      if (Object.prototype.hasOwnProperty.call(this.subElements, field)) {
        const value = this.subElements[field].value;
        const parseValue = +value;

        productResult[field] = isNaN(parseValue) ? value : parseValue;
      } else {
        if (field === 'images') {
          productResult[field] = this.getImagesFormList();
        } else {
          productResult[field] = product[field];
        }
      }
    }

    return [productResult];
  }

  uploadImage() {
    const { uploadImage, imageListContainer } = this.subElements;
    const fileInput = new ImageInput(uploadImage, imageListContainer, this.getProductImageTemplate);

    document.body.append(fileInput.element);

    fileInput.click();
  }

  onSubmit(event) {
    event.preventDefault();

    this.save();
  }

  initEventListeners() {
    const uploadImageButton = this.subElements.productForm.querySelector('[name="uploadImage"]');

    uploadImageButton.addEventListener('click', this.uploadImage.bind(this));

    this.subElements.productForm.addEventListener('submit', this.onSubmit.bind(this));
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
    this.element.remove();
    this.subElements = {};
  }
}