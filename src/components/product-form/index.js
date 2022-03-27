import SortableList from '../sortable-list/index';
import escapeHtml from '../../utils/escape-html';
import fetchJson from '../../utils/fetch-json';
import iconGrab from './icon-grab.svg';
import iconTrash from './icon-trash.svg';

export default class ProductForm {
  element = {};
  subElements = {};
  categories = [];
  product = null;
  images = [];
  url = '/api/rest/';
  defaultProduct = [{
    title: '',
    description: '',
    subcategory: '',
    discount: 0,
    images: [],
    price: 100,
    quantity: 1,
    status: 1,
  }];

  constructor (productId) {
    this.productId = productId;
  }

  get template() {
    const { discount, price, quantity } = this.defaultProduct;
    return `
      <div class = "product-form">
        <form data-element="productForm" class="form-grid">
            <div class="form-group form-group__half_left">
              <fieldset>
                <label for="title" class="form-label">Название товара</label>
                <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
              </fieldset>
            </div>
            <div class="form-group form-group__wide">
              <label class="form-label">Описание</label>
              <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
            </div>
            <div class="form-group form-group__wide" data-element="sortable-list-container">
              <label class="form-label">Фото</label>
              <div data-element="imageListContainer"></div>
              <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
            </div>
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              <select id="subcategory" class="form-control" name="subcategory">
                ${this.getOptionsCategories(this.categories)}
              </select>
            </div>
              <div class="form-group form-group__half_left form-group__two-col">
              <fieldset>
                <label for="price" class="form-label">Цена ($)</label>
                <input id="price" required="" type="number" name="price" class="form-control" placeholder="${price}">
              </fieldset>
              <fieldset>
                <label for="discount" class="form-label">Скидка ($)</label>
                <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="${discount}">
              </fieldset>
            </div>
            <div class="form-group form-group__part-half">
              <label for="quantity" class="form-label">Количество</label>
              <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="${quantity}">
            </div>
            <div class="form-group form-group__part-half">
              <label for="status" class="form-label">Статус</label>
              <select id="status" class="form-control" name="status">
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
  async save() {
    const data = this.getFormData();
    const result = await fetchJson(`${process.env.BACKEND_URL}/api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    this.dispatchEvent(result.id);
  }
  dispatchEvent = (id) => {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  };

  uploadImageHandler = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;
      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;
        formData.append('image', file);
        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;
        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });
        
        imageListContainer.append(this.getImage(result.data.link, file.name));
        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;
        fileInput.remove();
      }
    });

    fileInput.hidden = 'true';
    document.body.append(fileInput);
    fileInput.click();
  };

  getListImages = data => {
    return data.map(({url, source}) => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getImage(url, source).outerHTML;
      return wrapper.firstElementChild;
    });
  };

  getImage = (url, name) => {
    const wrapper = document.createElement('div');
    wrapper.insertAdjacentHTML('beforeend', `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <span>
        <img src="${iconGrab}" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
        <span>${escapeHtml(name)}</span>
      </span>
      <button type="button">
        <img src="${iconTrash}" data-delete-handle="" alt="delete">
      </button>
    </li>
    `);
    return wrapper.firstElementChild;
  };

  getOptionsCategories = data => {
    return data.reduce((acc, item) => {
      acc.push(...item.subcategories.map(subcat => {
        return `<option value="${subcat.id}">${item.title} &gt; ${subcat.title}</option>`;
      })); 
      return acc;
    }, []).join('');
  };

  loadData = async type => {
    switch (type) {
    case 'categories': {
      const categoriesUrl = new URL(this.url + type, process.env.BACKEND_URL);
      categoriesUrl.searchParams.set('_sort', 'weight');
      categoriesUrl.searchParams.set('_refs', 'subcategory');
      return await fetchJson(categoriesUrl);
    } 
    case 'products': {
      const productsUrl = new URL(this.url + type, process.env.BACKEND_URL);
      productsUrl.searchParams.set('id', this.productId);
      return await fetchJson(productsUrl);
    }
    }
  };

  render = async () => {
    const categoriesPromise = this.loadData('categories');
    const productPromise = this.productId 
      ? this.loadData('products')
      : Promise.resolve(this.defaultProduct);
    const [categotiesData, productData] = await Promise.all([categoriesPromise, productPromise]);
    const [product] = productData;
    this.categories = categotiesData;
    this.product = product;
    this.images = product.images;
    this.renderForm();

    this.subElements
    .imageListContainer
    .append(new SortableList({items: this.getListImages(this.images)}).element);

    if (product) {
      this.setTextFields(product);
      this.initEventListeners();
    }
    
    return this.element;
  };

  renderForm = () => {
    const $wrapper = document.createElement('div');
    $wrapper.insertAdjacentHTML('beforeend', this.template);
    this.element = $wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  };
  
  submitFormHandler = async (event) => {
    event.preventDefault();
    this.save();
  };

  setTextFields = (product) => {
    const form = this.subElements.productForm;
    let [fieldsForm] = this.defaultProduct;
    fieldsForm = Object.keys(fieldsForm).filter(item => !item.includes('images'));

    fieldsForm.forEach(field => {
      form.querySelector(`#${field}`).value = product[field];
    });
  };

  getFormData = () => {
    const data = {};
    const { productForm, imageListContainer } = this.subElements;
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultProduct).filter(field => field !== 'images');
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;

    fields.forEach(field => {
      const value = getValue(field);
      data[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    });
    data.images = [];
    data.id = this.productId;

    const images = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    images.forEach(image => {
      data.images.push({
        source: image.alt,
        url: image.src
      });
    });
    return data;
  };

  initEventListeners = () => {
    this.subElements.productForm.addEventListener('submit', this.submitFormHandler);
    this.subElements.uploadImage.addEventListener('click', this.uploadImageHandler);
  };

  getSubElements = el => {
    return [...el.querySelectorAll('[data-element]')].reduce((acc, item) => {
      const { element } = item.dataset;
      acc[element] = item;
      return acc;
    }, {});
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.element = null;
    this.subElements = null;
  };
  
}