import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  constructor(productId) {

    if (productId) {
      this.productId = productId;
      this.mode = 'edit';
    } else {
      this.mode = 'create';
    }

    this.reqParams = {
      _sort: 'weight',
      _refs: 'subcategory'
    }

    this.getListCategory();
    if (this.mode === 'edit') {
      this.getProductDetails(this.productId);
    }
  }

  /**
   * Create url with param
   */
  createUrl(api) {
    const url = new URL(api, BACKEND_URL);

    for (let key of Object.keys(this.reqParams)) {
      const value = this.reqParams[key];
      url.searchParams.set(key, value)
    }

    return url;
  }

  /**
   * Send request for categories data and execute method which update template with categories
   */
  async getListCategory() {
    const url = '/api/rest/categories';

    this.reqParams = ({
      _sort: 'weight',
      _refs: 'subcategory'
    })

    const response = await fetchJson(this.createUrl(url))
    this.updateCategories(response);
  }

  /**
   * Send request for product details and execute method which update template with product form
   */
  async getProductDetails(id) {
    const url = '/api/rest/products';

    this.reqParams = ({
      id: id
    })

    if (this.mode === 'edit') {
      const response = await fetchJson(this.createUrl(url));
      this.updateProductDetails(response); // Обновляем данные на форме
    }
    this.initEventListeners();
  }

  /**
   * Update html which categories
   */
  updateCategories(categories) { // FIXME Сделать правильно отображение
    const result = categories.map(element => {
      return element.subcategories.map(subElement => {
        return `<option value="${subElement.id}">${element.title} &gt; ${subElement.title}</option>`
      })
    }).join('');

    this.subElements.subcategory.innerHTML = result;
  }

  /**
   * Update html with product details
   */
  updateProductDetails([{ title, description, price, discount, quantity, status }]) {
    this.subElements['product-name'].value = title;
    this.subElements['product-description'].value = description;
    this.subElements['product-price'].value = price;
    this.subElements['product-discount'].value = discount;
    this.subElements['product-quantity'].value = quantity;
    this.subElements['product-status'].value = status; //TODO Тут подумать!
  }

  /**
   * Adds new Image in imageListContainer
   */
  updateImageListContainer(link = 'http://', fileName = 'Image.jpg') { //FIXME Заглушка

    const li = document.createElement('li');
    li.classList.add(['products-edit__imagelist-item', 'sortable-list__item']);
    li.innerHTML = getImageListContainerLi();

    const items = {
      items: [li]
    }

    const list = new SortableList(items);
    
    const imageUl = this.subElements['imageUl'];
    imageUl.append(list.element);

    // Utils functions below
    function getImageListContainerLi() { //FIXME Не уверен что это хороший подход
      return `
              <input type="hidden" name="url" value="${link}">
              <input type="hidden" name="source" value="${fileName}">
              <span>
                <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${link}">
                <span>${fileName}</span>
              </span>
              <button type="button">
                <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
              </button>
            `
    }
  }

  /**
   * Send user images on the server and return array of images links.
   */
  uploadImagesOnServer() {
    const result = []; // Массив объектов с информацией о файле

    const img = document.createElement('input'); // Создаем элемент input с типом file
    img.setAttribute('type', 'file');
    img.click();

    img.addEventListener('change', async () => {
      let promiseArray = [];

      // Перебираем все файлы, которые выбрал пользователь и по очереди отправялем на сервер
      for (let i = 0; i < img.files.length; i++) {
        promiseArray.push(await this.sendImageOnServer(img.files[i]));
      }

      Promise.all(promiseArray).then(links => listOfImagesUrl.push([...links]));
    });

    return result;
  }

  /**
   * Sends user file on the server and return file info object {filenName, link}
   */
  async sendImageOnServer(file) {
    const response = await fetchJson('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
      },
      body: file
    });

    return {
      file: file.name,
      link: await response.data.link //FIXME Нужен ли тут await? Вроде нет мы же ждем пока fetch не отработает
    }
  }

  /**
   * Return JSON from formData
   */
  getJsonFromProductForm() {
    const formData = new FormData(this.subElements['productForm']);
    const json = JSON.stringify(Object.fromEntries(formData));

    return json;
  }

  /**
   * Sends edited product details
   */
  async sendProductRequest() {
    const reqBody = this.getJsonFromProductForm();
    let options = {}

    switch (this.mode) {
      case 'edit': {
        options = {
          method: 'PATH',
          headers: {
            'Content-type': 'Application/json'
          },
          body: reqBody
        }
        break;
      }
      case 'create': {
        options = {
          method: 'PUT',
          headers: {
            'Content-type': 'Application/json'
          },
          body: reqBody
        }
        break;
      }
      default: {
        break;
      }
    }

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`,
        options
      );
      this.dispatchEvent(result.id);
    } catch (error) {
      throw new Error('something gone wrong with error : ' + error);
    }
  }

  dispatchEvent(id) {

    switch (this.mode) {
      case 'edit': {
        new CustomEvent('product-updated', { detail: id })
        break;
      }
      case 'create': {
        new CustomEvent('product-saved');
        break
      }
    }

    this.element.dispatchEvent(event);
  }

  /**
   * Init event listeners
   */
  initEventListeners() {
    const productForm = this.subElements['productForm'];
    const uploadImage = this.subElements['upload-image'];


    productForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Убираем поведение по дефолту
      this.sendProductRequest();
    });

    uploadImage.addEventListener('click', (event) => {
      this.uploadImagesOnServer();
    })
  }

  setButtonTextContent() {
    switch (this.mode) {
      case 'edit': {
        return 'Сохранить товар'
      }
      case 'create': {
        return 'Добавить товар'
      }
    }
  }

  getTemplate() {
    return `
            <div class="product-form">
            <form data-element="productForm" class="form-grid">
              <div class="form-group form-group__half_left">
                <fieldset>
                  <label class="form-label">Название товара</label>
                  <input data-element="product-name" required="" type="text" name="title" class="form-control" placeholder="Название товара">
                </fieldset>
              </div>
              <div class="form-group form-group__wide">
                <label class="form-label">Описание</label>
                <textarea data-element="product-description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
              </div>
              <div class="form-group form-group__wide" data-element="sortable-list-container">
                <label class="form-label">Фото</label>
                <div data-element="imageListContainer">
                  <ul data-element="imageUl" class="sortable-list">
                  </ul>
                </div>
                <button type="button" data-element="upload-image" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
              </div>
              <div class="form-group form-group__half_left">
                <label class="form-label">Категория</label>
                <select data-element="subcategory" class="form-control" name="subcategory">
                </select>
              </div>
              <div class="form-group form-group__half_left form-group__two-col">
                <fieldset>
                  <label class="form-label">Цена ($)</label>
                  <input data-element="product-price" required="" type="number" name="price" class="form-control" placeholder="100">
                </fieldset>
                <fieldset>
                  <label class="form-label">Скидка ($)</label>
                  <input data-element="product-discount" required="" type="number" name="discount" class="form-control" placeholder="0">
                </fieldset>
              </div>
              <div class="form-group form-group__part-half">
                <label class="form-label">Количество</label>
                <input data-element="product-quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
              </div>
              <div class="form-group form-group__part-half">
                <label class="form-label">Статус</label>
                <select data-element="product-status" class="form-control" name="status">
                  <option value="1">Активен</option>
                  <option value="0">Неактивен</option>
                </select>
              </div>
              <div class="form-buttons">
                <button type="submit" name="save" class="button-primary-outline">
                  ${this.setButtonTextContent()}
                </button>
              </div>
            </form>
           `
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.updateImageListContainer(); //FIXME
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (let sub of elements) {
      const name = sub.dataset.element;
      result[name] = sub;
    }

    return result;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element.remove();
  }
}
