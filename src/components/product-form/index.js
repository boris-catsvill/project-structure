import SortableList from '../sortable-list/index.js';
import NotificationMessage from '../notification/index.js';

import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json';

export default class ProductForm {
  element
  subElements = {}
  product = {}
  categories = {}

  constructor (productId) {
    this.productId = productId;
  }

  renderImages () {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button data-element="uploadButton" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
    `;
  }

  renderImage (image) {
    return `
      <input type="hidden" name="url" value="${image.url}">
      <input type="hidden" name="source" value="${image.source}">
      <span>
    <img src="icon-grab.svg" data-grab-handle="" alt="grab">
    <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
    <span>${image.source}</span>
  </span>
      <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    `;
  }

  renderCategories () {
    const categories = this.categories.reduce((prevCat, cat) => {
      return [
        ...prevCat,
        ...cat.subcategories.reduce((prevSubcat, subcat) => {
          return [...prevSubcat, {
            id: subcat.id,
            label: `${cat.title} > ${subcat.title}`
          }];
        }, [])
      ];
    }, []);

    return `
    <div class="form-group form-group__half_left">
      <label class="form-label">Категория</label>
      <select class="form-control" id="subcategory" name="subcategory">
      ${categories.map(elem => {
    return (new Option(elem.label, elem.id, elem.id === this.product.subcategory).outerHTML);
  }).join('')}
        </select>
      </div>
      `;
  }

  renderForm () {
    return `
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" id="description" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      ${this.renderImages()}
      ${this.renderCategories()}
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" id="price" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" id="discount" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" id="quantity" type="number" class="form-control" name="quantity" placeholder="1">
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
          ${this.productId ? 'Сохранить товар' : 'Добавить товар'}
        </button>
      </div>
      <input data-element="file-input" type="file" style="display: none;" />
    </form>
    `;
  }

  fillForm () {
    const {title = '', price, quantity, status, discount, description} = this.product;

    this.element.querySelector('#title').value = title;
    this.element.querySelector('#description').value = escapeHtml(description);
    this.element.querySelector('#price').value = price;
    this.element.querySelector('#quantity').value = quantity;
    this.element.querySelector('#discount').value = discount;
    this.element.querySelector('#status').value = status;
  }

  getSubElements (element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  uploadImage = async (event) => {
    const uploadButton = this.subElements.uploadButton;

    uploadButton.disabled = true;
    uploadButton.classList.add('is-loading');

    const file = event.target.files[0];

    const formData = new FormData();
    formData.append('image', file);

    try {
      const resp = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        body: formData,
        headers: {
          "authorization": `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          "referer": 'https://course-js.javascript.ru/'
        }
      });

      const wrapper = document.createElement('li');

      wrapper.innerHTML = this.renderImage({url: resp.data.link, source: file.name});
      wrapper.classList.add('products-edit__imagelist-item', 'sortable-list__item');

      this.subElements.imageListContainer.firstElementChild.append(wrapper);

      uploadButton.disabled = false;
      uploadButton.classList.remove('is-loading');
    } catch (error) {
      const notification = new NotificationMessage(error.message, {
        duration: 2000,
        type: 'error'
      });
  
      notification.show();

      uploadButton.disabled = false;
      uploadButton.classList.remove('is-loading');
    }
  }

  getFormData () {
    const res = {};

    res.id = this.productId;

    res.title = this.element.querySelector('#title').value;
    res.description = this.element.querySelector('#description').value;
    res.price = Number(this.element.querySelector('#price').value);
    res.quantity = Number(this.element.querySelector('#quantity').value);
    res.discount = Number(this.element.querySelector('#discount').value);
    res.status = Number(this.element.querySelector('#status').value);

    res.subcategory = this.element.querySelector('#subcategory').value;

    const urls = this.subElements.imageListContainer.firstElementChild.querySelectorAll('[name=url]');
    const sources = this.subElements.imageListContainer.firstElementChild.querySelectorAll('[name=source]');

    res.images = Array.from(urls).map((url, index) => {
      return { url: url.value, source: sources[index].value };
    });

    return res;
  }

  save = async () => {
    const formData = this.getFormData();

    try {
      const response = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        body: JSON.stringify(formData),
        headers: {
          'content-type': 'application/json'
        }
      });

      this.element.dispatchEvent(new CustomEvent(this.productId ? "product-updated" : "product-saved", {
        detail: response.id
      }));
    } catch (error) {
      const notification = new NotificationMessage(error.message, {
        duration: 2000,
        type: 'error'
      });
  
      notification.show();
    }  
  }

  async render () {
    try {
      const requests = [];

      requests.push(fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`));

      if (this.productId) {
        requests.push(fetchJson(`${process.env.BACKEND_URL}api/rest/products?id=${this.productId}`));
      }

      const [categories, product] = await Promise.all(requests);

      this.categories = categories;
      if (product) {
        this.product = product[0];
      }

      const wrapper = document.createElement('div');

      wrapper.innerHTML = this.renderForm();

      const element = wrapper.firstElementChild;

      this.element = element;
      this.subElements = this.getSubElements(wrapper);

      const sortableList = new SortableList({
        items: this.productId ? this.product.images.map(image => {
          const element = document.createElement('li');
          element.classList.add('products-edit__imagelist-item');
    
          element.innerHTML = this.renderImage(image);
    
          return element;
        }) : []
      });

      this.subElements.imageListContainer.append(sortableList.element);

      this.element.addEventListener('submit', (event) => {
        event.preventDefault();
        this.save();
      });

      this.subElements.uploadButton.addEventListener('pointerdown', () => this.subElements["file-input"].click());
      this.subElements["file-input"].addEventListener('change', this.uploadImage);

      if (this.productId) {
        this.fillForm();
      }

      return this.element;
    } catch (error) {
      const notification = new NotificationMessage(error.message, {
        duration: 2000,
        type: 'error'
      });
  
      notification.show();
    }
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
