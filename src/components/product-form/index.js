import SortableList from '../sortable-list/index.js';

import fetchJson from '../../utils/fetch-json.js';
import escapeHtml from '../../utils/escape-html.js';

const IMGUR_CLIENT_ID = `${process.env.IMGUR_CLIENT_ID}`;
const BACKEND_URL = `${process.env.BACKEND_URL}`

export default class ProductForm {

  onEditForm = (event) => {

    const fieldsToNumberTypeOfData = ['price', 'quantity', 'discount', 'status']

    if (fieldsToNumberTypeOfData.includes(event.target.id)) {

      this.productData[event.target.id] = Number(event.target.value);

    }
    else {

      this.productData[event.target.id] = event.target.value;
    }

  }

  imageUpload = event => {

    const input = document.createElement('input');

    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {

      const formData = new FormData();
      const { uploadImage, imageListContainer } = this.subElements;

      const file = input.files[0];

      formData.append("image", file);

      uploadImage.classList.add('is-loading');
      uploadImage.disabled = true;

      const response = await fetchJson("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
        },
        body: formData
      });

      const image = {
        url: response.data.link,
        source: file.name,
      }

      imageListContainer.firstElementChild.append(this.getImage(image.source, image.url))
      this.productData.images.push(image)

      uploadImage.classList.remove('is-loading');
      uploadImage.disabled = false;
    };

    input.click();
  }

  onSubmit = (event) => {

    event.preventDefault();
    this.save();
  }

  onRemoveImage = (event) => {

    const currentImage = event.detail.querySelector('input').value;

    this.productData.images = this.productData.images.filter(image => image.url !== currentImage)

  }

  constructor(productId) {

    this.productId = productId;
    this.productData = {
      title: '',
      description: '',
      quantity: '',
      subcategory: '',
      status: '',
      images: [],
      price: '',
      discount: ''
    };
    this.categoriesData = [];

  }

  async render() {

    if (this.productId) {

      const [categoriesData, [productResponse]] = await Promise.all([

        fetchJson(`https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory`),
        fetchJson(`${BACKEND_URL}api/rest/products?id=${this.productId}`),
      ])

      this.categoriesData = categoriesData;
      this.productData = productResponse

    } else {

      this.categoriesData = await fetchJson(`https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory`);

    }

    const element = document.createElement('div');

    element.innerHTML = this.template();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(element);

    this.sortableList = new SortableList({ items: this.getListItems() })

    this.subElements.imageListContainer.append(this.sortableList.element)

    this.getСategories();

    this.addEventListeners()

    return this.element;
  }

  getListItems(images = this.productData.images) {

    return images.map(({ source, url }) => {

      return this.getImage(source, url)

    })
  }

  getImage(source, url, tag = 'li') {

    const elem = document.createElement(tag);
    elem.className = 'products-edit__imagelist-item sortable-list__item'

    elem.innerHTML = `
     <input type="hidden" name="url" value="${escapeHtml(url)}">
          <input type="hidden" name="source" value="${escapeHtml(source)}">
          <span>
          <img src="/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
            <span>${escapeHtml(source)}</span>
          </span>
          <button type="button">
            <img src="/icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
    `
    return elem;
  }

  getSubElements(element) {

    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((result, item) => {
      result[item.dataset.element] = item;
      return result;
    }, {})
  }

  getСategories() {

    for (const { title, subcategories } of this.categoriesData) {

      for (const { id: value, title: subtitle } of subcategories) {

        const newOption = new Option(`${title} > ${subtitle}`, value, false, this.productData.subcategory === value);

        this.subElements.productCategory.add(newOption);
      }
    }
  }

  async save() {

    const response = await fetchJson(`${BACKEND_URL}api/rest/products`, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify(this.productData)
    });

    this.dispatchEvent(response);
  }

  dispatchEvent(product) {

    const event = this.productId
      ? new CustomEvent("product-updated", { detail: product.id })
      : new CustomEvent("product-saved", { detail: product });

    this.element.dispatchEvent(event);
  }

  addEventListeners() {
    const { productForm, uploadImage } = this.subElements;
    productForm.addEventListener('change', this.onEditForm);
    productForm.addEventListener('submit', this.onSubmit)
    uploadImage.addEventListener("click", this.imageUpload);

    this.sortableList.element.addEventListener('remove-item', this.onRemoveImage)
  }

  template() {

    return `
    <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" id="title" type="text" name="title" class="form-control"
           placeholder="Название товара" value='${this.productData.title}'>
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" id="description" class="form-control" name="description" data-element="productDescription"
        placeholder="Описание товара">${this.productData.description}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
       
        </div>
        <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control"  id="subcategory"  data-element="productCategory">
         
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" id="price" name="price"
           class="form-control" placeholder="100" value='${this.productData.price}'>
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" id="discount" name="discount" class="form-control"
            placeholder="0" value='${this.productData.discount}'>
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" id="quantity" type="number" class="form-control" name="quantity"
         placeholder="1" value='${this.productData.quantity}'>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
           ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>
    `
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;

  }
}
