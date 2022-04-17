import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json';
import SortableList from '../sortable-list';
import NotificationMessage from '../notification';

export default class ProductForm {
  element;
  subElements = {};
  components = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
    images: []
  };

  constructor(productId) {
    this.productId = productId;
  }

  getTemplate(products, categories) {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">

        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input
              required=""
              type="text"
              id="title"
              class="form-control"
              placeholder="Название товара"
              value = '${products.title}'>
          </fieldset>
        </div>

        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea
            required=""
            class="form-control"
            id="description"
            data-element="productDescription"
            placeholder="Описание товара">${products.description}</textarea>
        </div>

        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">

            <!-- sotableList -->

          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></input>
        </div>

        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.getSelectCategories(categories)}
        </div>

        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input
              required=""
              type="number"
              id="price"
              class="form-control"
              placeholder="100"
              value = "${products.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input
              required=""
              type="number"
              id="discount"
              class="form-control"
              placeholder="0"
              value = "${products.discount}">
          </fieldset>
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input
            required=""
            type="number"
            class="form-control"
            id="quantity"
            placeholder="1"
            value = "${products.quantity}">
        </div>

        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" id="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>

        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? 'Сохранить' : 'Добавить'} товар
          </button>
        </div>
      </form>
  </div>

    `;
  }

  getSelectCategories(categories) {
    return `
    <select class="form-control" id="subcategory">
      ${categories
        .map(item => {
          return item.subcategories
            .map(j => {
              return `
                <option
                  value=${j.id}>${item.title} &gt; ${j.title}
                </option>`;
            }).join('');
        }).join('')}
    </select>`;
  }

  getImagesList(data) {
    if (!this.productId && data.images !== undefined) {
      return '';
    }

    const sortableList = new SortableList({
      items: data.images.map(item => {
        const element = document.createElement('li');

        element.classList = 'products-edit__imagelist-item sortable-list__item';

        element.innerHTML = `
          <input type="hidden" name="url" id="url" value="${item.url}">
            <input type="hidden" name="source" id="source" value=${item.source}>
            <span>
              <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
              <span>${item.source}</span>
            </span>
            <button type="button">
              <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
          `;
        return element;
      })
    });

    this.components = {
      sortableList
    };

    this.subElements.imageListContainer.append(sortableList.element);
  }

  getImage(url, source) {
    const element = document.createElement('li');
    element.classList = 'products-edit__imagelist-item sortable-list__item';

    element.innerHTML = `
          <input type="hidden" name="url" id="url" value="${url}">
            <input type="hidden" name="source" id="source" value=${source}>
            <span>
              <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${url}">
              <span>${source}</span>
            </span>
            <button type="button">
              <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
          `;
    return element;
  }

  async render() {
    const categoriesPromise = this.loadDataCategories();

    const productPromise = this.productId
      ? this.loadDataProducts(this.productId)
      : Promise.resolve([this.defaultFormData]);

    const [categoriesData, productResponse] = await Promise.all([
      categoriesPromise,
      productPromise
    ]);
    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;

    this.renderForm();

    return this.element;
  }

  renderForm() {
    const wrapper = document.createElement(`div`);
    wrapper.innerHTML = this.getTemplate(this.formData, this.categories);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.getImagesList(this.formData);
    this.initEventListeners();
  }

  initEventListeners() {
    const { productForm, imageListContainer } = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    productForm.addEventListener('pointerdown', this.uploadImage);
    imageListContainer.addEventListener('pointerdown', this.deleteImage);
  }

  deleteImage(event) {
    const deleteBtn = event.target.closest('button[data-delete-handle]');
    if (!deleteBtn) return;
    event.target.closest('li').remove();
  }

  uploadImage = async event => {
    const uploadImage = event.target.closest('button[name = uploadImage]');
    if (!uploadImage) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async () => {
      uploadImage.classList.add('is-loading');
      try {
        const [file] = fileInput.files;
        const result = await this.upload(file);

        const currentImage = this.getImage(result.data.link, file.name);

        this.subElements.imageListContainer.children[0].append(currentImage);
      } catch (error) {
        console.error(error);
        const notification = new NotificationMessage('Изобрадение не загружено', {
          duration: 1000,
          type: 'error'
        });

        notification.show();
      }

      uploadImage.classList.remove('is-loading');
      const notification = new NotificationMessage('Изобрадение загружено', {
        duration: 1000,
        type: 'success'
      });

      notification.show();
    };
    fileInput.click();
  };

  async upload(file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });
      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  onSubmit = event => {
    event.preventDefault();
    const notification = new NotificationMessage('Товар сохранен', {
      duration: 1000,
      type: 'success'
    });

    notification.show();

    this.save();
  };

  async save() {
    const formData = this.getFormData();
    formData.images = this.prepareImagesData();
    const json = JSON.stringify(formData);

    const resolve = await fetch(`${process.env.BACKEND_URL}api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: json,
      referrer: ''
    });

    this.dispatchEvent();
  }

  dispatchEvent() {
    const event = this.productId
      ? new CustomEvent('product-updated')
      : new CustomEvent('product-saved');
    this.element.dispatchEvent(event);
  }

  getFormData = () => {
    const { productForm } = this.subElements;
    const temp = productForm.elements;

    return {
      id: this.productId,
      title: temp.title.value,
      description: temp.description.value,
      subcategory: temp.subcategory.value,
      price: parseInt(temp.price.value, 10),
      quantity: parseInt(temp.quantity.value, 10),
      discount: parseInt(temp.discount.value, 10),
      status: parseInt(temp.status.value, 10),
      images: []
    };
  };

  prepareImagesData() {
    const arrayOfURL = [];
    const currentArray = [];

    const formData = new FormData(this.subElements.productForm);

    for (const [name, value] of formData) {
      if (name === 'url' || name === 'source') {
        arrayOfURL.push({ name, value });
      }
    }

    for (let i = 0; i < arrayOfURL.length; i += 2) {
      const w = {
        url: arrayOfURL[i].value,
        source: arrayOfURL[i + 1].value
      };
      currentArray.push(w);
    }

    return currentArray;
  }

  async loadDataCategories() {
    const categories = new URL(`${process.env.BACKEND_URL}api/rest/categories`);
    categories.searchParams.set('_sort', 'weight');
    categories.searchParams.set('_refs', 'subcategory');
    return await fetchJson(categories);
  }

  async loadDataProducts(id) {
    const formData = new URL(`${process.env.BACKEND_URL}api/rest/products`);
    formData.searchParams.set('id', `${id}`);
    return await fetchJson(formData);
  }

  getSubElements(element) {
    const result = [];
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.subElements.productForm.removeEventListener('submit', this.onSubmit);
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
