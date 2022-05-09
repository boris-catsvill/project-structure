import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import ImageUploader from '../ImageUploader/index.js';
import Notification from '../../components/notification/index.js';


const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subelements = {}
  imageUploadOnClick = (event) => {
    const target = event.target;
    if (!target.closest('[name="uploadImage"]')) return;

    fileInput.click();

  }
  fetchImageOnServer = async (event) => {
    const uploader = new ImageUploader();
    const uplBtn = this.subelements.uploadImg;

    try {
      const [file] = fileInput.files;
      uplBtn.classList.add('is-loading');
      uplBtn.disabled = true;
      const response = await uploader.upload(file);
      if (response.error) {
        console.error(response.error);
        return;
      }

      this.subelements.imageListContainer.insertAdjacentHTML('beforeend', this.getImagesTemplate([{url: response.data.link, source: response.data.id}]));
    } catch (error) {
      console.error(error);
    }
    finally {
      uplBtn.classList.remove('is-loading');
      uplBtn.disabled = false;
    }

  }
  productSaveOnClick = async (event) => {

    event.preventDefault();
    const formData = this.getDataFromForm();

    try {
      const response = await fetch(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      }).then(r => r.json());
      console.error('DONE');
      this.dispatchEvent(response.id);
      const notification = new Notification("Успешно сохранено!", {type: 'success'});
      notification.show();
    } catch (error){
      const notification = new Notification("Возникла проблема при сохранении!", {type: 'error'});
      notification.show();
      console.error('problem');
      console.error(error);
    }


  }
  updateData = async (event) => {
    let pathArr = window.location.href.split('/');
    window.location = pathArr.slice(0, pathArr.length - 1).concat(event.detail.id).join('/');

  }
  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    const div = document.createElement('div');
    const productPromise = this.productId
      ? fetch(`${BACKEND_URL}/api/rest/products?id=${this.productId}`).then(resp => resp.json())
      : Promise.resolve([{}]);

    const categoryPromise = fetch(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`).then(resp => resp.json());

    const [productData, categoryData] = await Promise.all([productPromise, categoryPromise]);
    div.innerHTML = this.getTemplate(productData[0], categoryData);
    this.element = div.firstElementChild;
    this.subelements = this.getSubelements();
    this.subelements.uploadImg = this.subelements['sortable-list-container'].querySelector('[name="uploadImage"]');
    this.initEvents();

  }

  getImagesTemplate (imagesArray) {
    if (!imagesArray) return '';

    return imagesArray.map(item =>{
      return `
        <li class="products-edit__imagelist-item sortable-list__item">
          <input type="hidden" name="url" value="${item.url}">
          <input type="hidden" name="source" value="${item.source}">
          <span>
            <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
            <span>${item.source}</span>
          </span>
          <button type="button">
            <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
      </li>
      `;
    }).join('');
  }

  getCategotiesTemplate (response) {
    return response.map(item => {
      return item.subcategories.map(subcategory => {
        return `
           <option value="${subcategory.id}">${item.title} &gt; ${subcategory.title}</option>
        `;
      }).join('');
    }).join('');

  }

  getProductStatus (status) {
    if (status) {
      return `
        <option selected value="1">Активен</option>
        <option value="0">Неактивен</option>
      `;
    } else {
      return `
        <option value="1">Активен</option>
        <option selected value="0">Неактивен</option>
      `;
    }
  }

  getTemplate(productData, categoryData) {
    return `
      <div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value ='${productData.title || ''}'>  </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${productData.description || ''}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list">
           ${this.getImagesTemplate(productData.images)}
          </ul>
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        <input id="fileInput" type="file" hidden>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
            ${this.getCategotiesTemplate(categoryData)}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100" value="${productData.price || ''}"> </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0" value="${productData.discount || 0}"> </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${productData.quantity || ''}"> </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          ${this.getProductStatus(productData.status)}
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline"> Сохранить товар </button>
      </div>
    </form>
  </div>
    `;
  }

  initEvents () {
    document.addEventListener('click', this.imageUploadOnClick);
    const {productForm} = this.subelements;
    productForm.addEventListener('submit', this.productSaveOnClick);
    this.element.addEventListener('product-saved', this.updateData);
    this.element.addEventListener('product-updated', this.updateData);
    this.element.querySelector('#fileInput').addEventListener('change', this.fetchImageOnServer);

  }

  destroy () {
    this.remove();
    this.element = null;
    this.subelements = null;
    document.removeEventListener('click', this.imageUploadOnClick);
  }

  remove () {
    this.element.remove();
  }

  getDataFromForm () {
    const form = this.element.querySelector('form');
    const subcat = form.querySelector('[name="subcategory"]');
    const ststus = form.querySelector('[name="status"]');
    return {
          id: this.productId,
          title: form.querySelector('[name="title"]').value,
          description: form.querySelector('[name="description"]').textContent,
          subcategory: subcat.options[subcat.selectedIndex].value,
          price: Number(form.querySelector('[name="price"]').value),
          quantity: Number(form.querySelector('[name="quantity"]').value),
          discount: Number(form.querySelector('[name="discount"]').value) || 0,
          status: Number(ststus.options[ststus.selectedIndex].value),
          images: this.getImagesList()
    }

  }

  getImagesList () {
    return [...this.subelements.imageListContainer.querySelectorAll('li')].map(item => {
      return {
        source: item.querySelector('[name="source"]').value,
        url: item.querySelector('[name="url"]').value
      };
    });
  }

  dispatchEvent (productId) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: {id: productId }})
      : new CustomEvent('product-saved', { detail: {id: productId} });

    this.element.dispatchEvent(event);

  }

  getSubelements () {
    const subelements = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      subelements[element.dataset.element] = element;
    }

    return subelements;
  }

}
