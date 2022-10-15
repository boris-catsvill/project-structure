import SortableList from '../sortable-list/index.js';
import NotificationMessage from '../../components/notification/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  subElements = {};
  keyFields = [
    {
      name: 'title',
      value: item => escapeHtml(item.value)
    },
    {
      name: 'description',
      value: item => escapeHtml(item.value)
    },
    {
      name: 'subcategory',
      value: item => item.value
    },
    {
      name: 'price',
      value: item => item.valueAsNumber
    },
    {
      name: 'status',
      value: item => parseInt(item.value)
    },
    {
      name: 'quantity',
      value: item => item.valueAsNumber
    },
    {
      name: 'discount',
      value: item => item.valueAsNumber
    }
  ];

  constructor(productId) {
    this.productId = productId;
    this.init();
  }

  fillSubElements() {
    const allDataElem = this.element.querySelectorAll('[data-element]');
    for (const element of allDataElem) {
      this.subElements[element.dataset.element] = element;
    }
  }

  getImgItemText({ url = '', source = '' } = {}) {
    const escUrl = escapeHtml(url);
    const escSource = escapeHtml(source);
    return `
    <li class="products-edit__imagelist-item sortable-list__item" ondragstart="return false;">
      <input type="hidden" name="url" value="${escUrl}">
      <input type="hidden" name="source" value="${escSource}">
      <span>
        <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${escUrl}">
        <span>${escSource}</span>
      </span>
      <button type="button">
        <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
      </button>
    </li>`;
  }

  getCategoryOptionsTemplate(categories, catTitle = []) {
    return categories
      .map(value => {
        catTitle.push(value.title);
        if (value.subcategories) {
          const subCatOptionsText = this.getCategoryOptionsTemplate(value.subcategories, catTitle);
          catTitle.pop();
          return subCatOptionsText;
        }
        const escTitle = escapeHtml(catTitle.join(' > '));
        catTitle.pop();
        return `<option value="${value.id}">${escTitle}</option>`;
      })
      .join('');
  }

  get template() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара" id="title">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара" id="description"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">      
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100" id="price">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0" id="discount">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1" id="quantity">
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
          ${this.productId ? 'Сохранить товар' : 'Добавить товар'}
        </button>
      </div>
    </form>
    <form data-element="imgForm" style="display: none;">
      <input type="file" name="image" accept="image/*"> 
    </form>
  </div>`;
  }

  init() {
    const wraper = document.createElement('div');
    wraper.innerHTML = this.template;
    this.element = wraper.firstElementChild;
    this.fillSubElements();

    this.data = {};
    this.keyFields.forEach(item => {
      const curItem = this.subElements.productForm.elements[item.name];
      this.data[item.name] = item.value(curItem);
    });
    this.data.images = [];

    this.urlCat = new URL('api/rest/categories', BACKEND_URL);
    this.urlCat.searchParams.set('_sort', 'weight');
    this.urlCat.searchParams.set('_refs', 'subcategory');

    this.urlProd = new URL('api/rest/products', BACKEND_URL);
    this.urlImgService = new URL('https://api.imgur.com/3/image');

    this.subElements.productForm.addEventListener('submit', this.submitForm);
    this.subElements.productForm.elements['uploadImage'].addEventListener('click', event => {
      this.subElements.imgForm.elements['image'].dispatchEvent(new MouseEvent('click'));
    });
    this.subElements.imgForm.elements['image'].addEventListener('change', this.uploadFile);
    this.sortableListComponent = new SortableList();
    this.subElements.imageListContainer.append(this.sortableListComponent.element);
    this.sortableListComponent.element.addEventListener('sortlist-change', this.imageListChanged);
  }

  imageListChanged = event => {
    const itemList = this.data.images.splice(event.detail.indexBefore, 1)[0];
    if (event.detail.indexAfter > -1) {
      this.data.images.splice(event.detail.indexAfter, 0, itemList);
    }
  };

  uploadFile = async event => {
    try {
      const response = await fetchJson(this.urlImgService, {
        method: 'POST',
        body: new FormData(event.target.form),
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        }
      });
      const newImgItem = {
        url: response.data.link,
        source: event.target.files[0].name
      };
      this.data.images.push(newImgItem);
      this.sortableListComponent.element.insertAdjacentHTML(
        'beforeend',
        this.getImgItemText(newImgItem)
      );
    } catch (error) {
      new NotificationMessage(`${error}`, {
        type: 'error'
      }).show();
    }
  };

  submitForm = event => {
    event.preventDefault();

    this.save();
  };

  async save() {
    this.keyFields.forEach(item => {
      const curItem = this.subElements.productForm.elements[item.name];
      this.data[item.name] = item.value(curItem);
    });

    const method = this.data.id ? 'PATCH' : 'PUT';
    try {
      const response = await fetchJson(this.urlProd, {
        method: method,
        body: JSON.stringify(this.data),
        headers: {
          'Content-type': 'application/json'
        }
      });
      this.element.dispatchEvent(new Event(this.data.id ? 'product-updated' : 'product-saved'));

      this.data.id = response.id;
    } catch (error) {
      console.log(error);
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  fillFormData(data) {
    if (!data || !data.length) {
      return;
    }

    this.data = data[0];

    this.keyFields.forEach(item => {
      this.subElements.productForm.elements[item.name].value = this.data[item.name];
    });

    this.sortableListComponent.element.innerHTML = this.data.images
      .map(value => {
        return this.getImgItemText(value);
      })
      .join('');
  }

  async render() {
    let categories, data;
    if (this.productId) {
      this.urlProd.searchParams.set('id', this.productId);
      [categories, data] = await Promise.all([fetchJson(this.urlCat), fetchJson(this.urlProd)]);
      this.urlProd.searchParams.delete('id');
    } else {
      categories = await fetchJson(this.urlCat);
    }
    this.subElements.productForm.elements['subcategory'].innerHTML =
      this.getCategoryOptionsTemplate(categories);
    this.fillFormData(data);
    return this.element;
  }
}
