import SortableList from '../sortable-list/index';
import escapeHtml from '../../utils/escape-html';
import fetchJson from '../../utils/fetch-json';
import iconGrab from './icon-grab.svg';
import iconTrash from './icon-trash.svg';
import getSubElements from '../../utils/getSubElements';
import NotificationMessage from '../notification';

export default class ProductForm {
  element;
  subElements;
  imagesArray;

  defaultProductInfo = {
    title: '',
    description: '',
    images: [],
    subcategory: '',
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1,
  }

  constructor (productId) {
    this.productId = productId;

    this.render()
      .then(() => {});
  }

  getTitleInput() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  getDescriptionInput() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  getImageItem(imageInfo) {
    const element = document.createElement('li');
    const imageSrc = imageInfo.url ? escapeHtml(imageInfo.url) : '';
    const imageSource = imageInfo.source ? escapeHtml(imageInfo.source) : '';
    element.classList.add('products-edit__imagelist-item', 'sortable-list__item');
    element.innerHTML = `
      <span>
        <img src="${iconGrab}" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${imageSrc}">
        <span>${imageSource}</span>
      </span>
      <button type="button">
          <img src="${iconTrash}" data-delete-handle="" alt="delete">
      </button>
    `;
    return element;
  }

  getImageListInner(imageInfoArr) {
    if (!imageInfoArr || !imageInfoArr.length) {
      return;
    }
    const items = imageInfoArr.map(imageInfo => {
      return this.getImageItem(imageInfo);
    });
    const sortableList = new SortableList({
      items,
    });
    return sortableList.element;
  }

  getImageListWrapper() {
    return `
        <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline fit-content">
                <span>Загрузить</span>
            </button>
        </div>
    `;
  }

  getSelectSubcategories(categories) {
    return categories ? categories.map((category) => {
      return category.subcategories.map((subcategory) => {
        return `
          <option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>
        `;
      }).join('');
    }).join('') : null;
  }

  getSelectInput(categories) {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
          ${this.getSelectSubcategories(categories)}
        </select>
      </div>
    `;
  }

  getCostInput() {
    return `
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
    `;
  }

  getStatusInput() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
    `;
  }

  getCountInput() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
    `;
  }

  getButtonsInput() {
    return `
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    `;
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
            ${this.getTitleInput()}
            ${this.getDescriptionInput()}
            ${this.getImageListWrapper()}
            ${this.getSelectInput()}
            ${this.getCostInput()}
            ${this.getCountInput()}
            ${this.getStatusInput()}
            ${this.getButtonsInput()}
        </form>
      </div>
    `;
  }

  uploadImage = async (event) => {
    event.preventDefault();
    const [file] = event.target.files;

    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      const url = 'https://api.imgur.com/3/image';

      event.target.classList.add('is-loading');
      event.target.disabled = true;
      const result = await fetchJson(url, {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        },
        body: formData,
        referrer: '',
      });

      const newImage = {
        url: result.data.link,
        source: file.name,
      }

      this.imagesArray.push(newImage);
      this.updateImageList(this.imagesArray);

      event.target.classList.remove('is-loading');
      event.target.disabled = false;

      event.target.remove();
    }
  }

  showInputFile = () => {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.hidden = true;
    document.body.append(inputFile);
    inputFile.click();

    inputFile.addEventListener('change', this.uploadImage);
  }

  updateImageList(data) {
    this.subElements.imageListContainer.innerHTML = '';
    if (data.length) {
      this.subElements.imageListContainer.append(this.getImageListInner(data));
    }
  }

  updateProductInfo(productInfo) {
    this.imagesArray = productInfo.images;
    this.updateImageList(this.imagesArray);

    this.subElements.productForm.title.value = productInfo.title;
    this.subElements.productForm.description.value = productInfo.description;
    this.subElements.productForm.price.value = productInfo.price;
    this.subElements.productForm.quantity.value = productInfo.quantity;
    this.subElements.productForm.discount.value = productInfo.discount;
    this.subElements.productForm.status.value = productInfo.status;
  }

  updateCategoriesInfo(categoriesInfo) {
    this.subElements.productForm.subcategory.innerHTML = this.getSelectInput(categoriesInfo);
  }

  loadProductInfo(id) {
    const productUrl = new URL(`${process.env.BACKEND_URL}api/rest/products`);
    productUrl.searchParams.set('id', id);

    return fetchJson(productUrl);
  }

  loadCategoriesInfo() {
    const categoriesUrl = new URL(`${process.env.BACKEND_URL}api/rest/categories`);
    categoriesUrl.searchParams.set('_sort', 'weight');
    categoriesUrl.searchParams.set('_refs', 'subcategory');
    return fetchJson(categoriesUrl);
  }

  getFormData() {
    const data = {};
    data.id = this.productId || this.subElements.productForm.title.value;
    data.title = this.subElements.productForm.title.value;
    data.description = this.subElements.productForm.description.value;
    data.subcategory = this.subElements.productForm.subcategory.value;
    data.price = Number.parseInt(this.subElements.productForm.price.value);
    data.discount = Number.parseInt(this.subElements.productForm.discount.value);
    data.quantity = Number.parseInt(this.subElements.productForm.quantity.value);
    data.status = Number.parseInt(this.subElements.productForm.status.value);
    data.images = this.imagesArray;

    return data;
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  sendProductInfo = async (event) => {
    event.preventDefault();
    const url = `${process.env.BACKEND_URL}api/rest/products`;
    const data = this.getFormData();
    try {
      const result = await fetchJson(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error(error);
    }

  }

  addEventListeners() {
    this.subElements.productForm.uploadImage.addEventListener('click', this.showInputFile);
    this.subElements.productForm.addEventListener('submit', this.sendProductInfo);

    this.element.addEventListener('product-updated', () => {
      this.message = new NotificationMessage('Товар сохранен', { duration: 1500, type: 'notification_success'});
      this.message.show();
    });

    this.element.addEventListener('product-saved', () => {
      this.message = new NotificationMessage('Товар добавлен', { duration: 1500, type: 'notification_success'});
      this.message.show();
    });
  }

  async render () {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = getSubElements(element, 'element');

    const productPromise = this.productId ? await this.loadProductInfo(this.productId) : [this.defaultProductInfo];
    const categoriesPromise = this.loadCategoriesInfo();
    const [productInfo, categoriesInfo] = await Promise.all([productPromise, categoriesPromise]);

    this.updateProductInfo(productInfo[0]);
    this.updateCategoriesInfo(categoriesInfo);

    this.addEventListeners();
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
    this.element = null;
  }
}
