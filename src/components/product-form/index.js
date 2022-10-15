import SortableList from '../sortable-list/index.js';
import NotificationMessage from '../notification/index.js';

import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

import iconGrab from '../../components/product-form/icon-grab.svg';
import iconTrash from '../../components/product-form/icon-trash.svg';

export default class ProductForm {
  element;
  subElements = {};

  formData = {};
  categories = [];

  defaultFormData = {
    title: '',
    description: '',

    price: 100,
    discount: 0,
    quantity: 1,  
    status: 1,  

    subcategory: '',
    images: [],
  };

  constructor(productId = '') {
    this.productId = productId;

    this.render();
  }

  showNotification(type, message) {
    const notification = new NotificationMessage(message, { duration: 2000, type: type });

    notification.show();
  }

  addEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.submitHandler);

    this.subElements.uploadImage.addEventListener('click', this.uploadImageHandler);

    this.subElements.imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    })
  }

  addDispatchEvent() {
    const event = this.productId ? 'product-updated' : 'product-saved'
    const eventDaspatch = new CustomEvent(event);

    this.element.dispatchEvent(eventDaspatch);
  }
  
  submitHandler = async (event) => {
    event.preventDefault();
    await this.save()
  }

  async save() {
    const savedProduct = this.getFormValues();

    try {
      await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(savedProduct),
      })

      this.addDispatchEvent();
      this.showNotification('success', 'Товар сохранен');
    } catch (error) {
      console.error('Failed to save/add', error);
      this.showNotification('error', 'Ошибка. не удалось сохранить товар');
    }
  }

  getFormValues() {
    const formFields = Object.keys(this.defaultFormData).filter(item => item !== 'images');
    const productImages = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');
    
    const formValues = {
      id: this.productId,
      images: [],
    }

    for (const fieldName of formFields) {
      let value = this.subElements.productForm.querySelector(`[name="${fieldName}"]`).value;
      
      if (['discount', 'price', 'quantity', 'status'].some(item => item === fieldName)) {
        value = parseInt(value);
      }

      formValues[fieldName] = value;
    }

    for (const image of productImages) {
      formValues.images.push({
        url: image.src,
        source: image.alt
      })
    }

    return formValues
  }

  uploadImageHandler = () => {
    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';

    imageInput.addEventListener('change', async () => {
      const [file] = imageInput.files;

      if (file) {
        const form = new FormData();
        form.append('image', file);

        this.subElements.uploadImage.classList.add('is-loading');
        this.subElements.uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          },
          body: form,
          referrer: ''
        });

        const wrapper = document.createElement('div');
        wrapper.innerHTML = this.getImage(file.name, result.data.link);
        this.subElements.imageListContainer.firstElementChild.append(wrapper.firstElementChild);

        this.subElements.uploadImage.classList.remove('is-loading');
        this.subElements.uploadImage.disabled = false;

        imageInput.remove()
      }
    })

    imageInput.click()
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    
    this.subElements = this.getSubElements();
    this.element = this.element.firstElementChild;
    
    const promiseCategories = fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`);

    const promiseProductInfo = this.productId
    ? fetchJson(`${process.env.BACKEND_URL}api/rest/products?id=${this.productId}`)
    : Promise.resolve(this.defaultFormData)


    const [categories, responseProductInfo] = await Promise.all([
      promiseCategories, promiseProductInfo
    ])

    const productInfo = this.productId ? responseProductInfo[0] : responseProductInfo;

    this.formData = productInfo;
    this.categories = categories;

    this.getCategories();
    this.getForm();
    this.getImages();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара" id="title" value="">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required = "" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара" id="description"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>

          <div data-element="imageListContainer"></div>

          <button name="uploadImage" data-element="uploadImage" type="button" class="button-primary-outline fit-content">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory" id="subcategory"></select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" id="price" value="" placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required type="number" name="discount" class="form-control" id="discount" value="" placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required type="number" class="form-control" name="quantity" id="quantity" value="" placeholder="${this.defaultFormData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
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

  getCategories() {
    const select = this.subElements.productForm.querySelector('#subcategory');

    for (const category of this.categories) {
      if (category.subcategories) {
        for (const subCategory of category.subcategories) {
          select.add(new Option(`${category.title} > ${subCategory.title}`, subCategory.id));
        }
      } else {
        select.add(new Option(category.title, category.id));
      }
    }
  }

  getForm() {
    const formFields = Object.keys(this.defaultFormData).filter(item => item !== 'images');
    const productData = this.productId ? this.formData : this.defaultFormData;

    for (const fieldName of formFields) {
      let element = productData[fieldName];
      this.subElements.productForm.querySelector(`#${fieldName}`).value = element;
    }
  }

  getImages() {
    const items = this.formData.images.map(({ url, source }) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getImage(source, url);
      return wrapper.firstElementChild;
    })

    const imagesList = new SortableList({ items })
    this.subElements.imageListContainer.append(imagesList.element)
  }

  getImage(source, url) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="${iconGrab}" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="${iconTrash}" alt="delete" data-delete-handle>
        </button>
      </li>`
    return wrapper.innerHTML;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  remove () {
    this.element?.remove();
  }
  
  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.formData = {};
    this.categories = [];
  }
}
