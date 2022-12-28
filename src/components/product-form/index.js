import BasicComponent from '../basic-component';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import { deleteImage, uploadImage } from '../../utils/imgur-api';
import SortableList from '../sortable-list';
import { BACKEND_URL } from '../../constants';

export default class ProductForm extends BasicComponent {

  /**
   * @param {?string} productId
   */
  constructor(productId) {
    super();
    this.productId = productId;
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', event => {
      event.preventDefault();
      this.save();
    });

    /* Обработчик кнопки удаления изображения */
    this.subElements.imageListContainer.addEventListener('click', event => {
      const buttonDelete = event.target.closest('[data-delete-handle]');

      if (buttonDelete) {
        event.preventDefault();

        const item = event.target.closest('.products-edit__imagelist-item');
        if (item) {
          item.remove();

          if (item.dataset.deletehash) {
            deleteImage(item.dataset.deletehash);
          }
        }
      }
    });

    /* Обработчик загрузки файла */
    this.subElements.buttonUpload.addEventListener('click', event => {
      event.preventDefault();
      this.subElements.fileInput.click();
    });

    this.subElements.fileInput.addEventListener('change', async (event) => {
      const file = event.target.files[0];
      const result = await uploadImage(file);

      if (result.success) {
        this.sortableImages.element.append(ProductForm.createImageElement({
          source: file.name,
          url: result.data.link,
          deletehash: result.data.deletehash
        }));
      }
    });
  }

  async render() {
    this.element.className = 'product-form';
    this.element.innerHTML = this.getTemplate();

    this.subElements = BasicComponent.findSubElements(this.element);

    this.sortableImages = new SortableList({
      items: [],
      allowDelete: false
    });
    this.subElements.imageListContainer.append(this.sortableImages.element);

    const promises = [this.fetchCategories()];
    if (this.productId) {
      promises.push(this.fetchProduct());
    }

    await Promise.all(promises);

    return super.render();
  }

  /**
   * Загружает список категорий с сервера
   * @return {Promise<?>}
   */
  async fetchCategories() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const json = await fetchJson(url);

    const categoryList = [];
    for (const category of json) {
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          categoryList.push([subcategory.id, category.title + ' > ' + subcategory.title]);
        }
      } else {
        categoryList.push([category.id, category.title]);
      }
    }

    const select = this.subElements.categorySelect;
    select.innerHTML = '';

    categoryList.forEach(([id, title]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = title;
      select.append(option);
    });

    return json;
  }

  async fetchProduct() {
    const url = new URL('api/rest/products', BACKEND_URL);
    url.searchParams.set('id', this.productId);

    const model = (await fetchJson(url)).shift();

    const formElements = this.subElements.productForm.elements;

    // Заполняем поля формы по name
    for (const [key, value] of Object.entries(model)) {
      if (formElements[key]) {
        formElements[key].value = value;
      }
    }

    // Загруженные изображения
    this.sortableImages.element.innerHTML = '';
    this.sortableImages.element.append(...model.images.map(image => ProductForm.createImageElement(image)));
  }

  async save() {
    const formData = new FormData(this.subElements.productForm);

    // Преобразование в число
    const numericFields = [...this.subElements.productForm.elements]
      .filter(input => input.type === 'number' || input.name === 'status')
      .map(input => input.name);

    const model = Object.fromEntries(
      [...formData.entries()].map(item => numericFields.includes(item[0]) ? [item[0], Number(item[1])] : item)
    );

    // Избавляемся от лишних атрибутов, которые не нужны бэку
    model.images = [...this.sortableImages.element.querySelectorAll('.products-edit__imagelist-item')]
      .map(({ dataset }) => {
        return { url: dataset.url, source: dataset.source };
      });

    let eventName;
    let methodName;
    if (this.productId) {
      model.id = this.productId;
      eventName = 'product-updated';
      methodName = 'PATCH';
    } else {
      eventName = 'product-saved';
      methodName = 'PUT';
    }

    const url = new URL('api/rest/products', BACKEND_URL);
    const result = await fetchJson(url, {
      method: methodName,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      body: JSON.stringify(model)
    });

    this.element.dispatchEvent(new CustomEvent(eventName, { detail: result, bubbles: true }));
  }

  destroy() {
    this.sortableImages.destroy();
    super.destroy();
  }

  getTemplate() {
    return `<form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input type="text" name="title" id="title" class="form-control" required />
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea class="form-control" name="description" id="description" required></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortableListContainer">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button type="button" class="button-primary-outline" data-element="buttonUpload"><span>Загрузить</span></button>
        <input type="file" data-element="fileInput" hidden="hidden" />
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory" data-element="categorySelect"></select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена</label>
          <input type="number" name="price" id="price" class="form-control" required />
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка</label>
          <input type="number" name="discount" id="discount" class="form-control" value="0" required />
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input type="number" class="form-control" name="quantity" id="quantity" value="1" required />
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">Сохранить товар</button>
      </div>
    </form>`;
  }

  static createImageElement({ url, source, deletehash = '' }) {
    const el = document.createElement('li');
    el.classList.add('products-edit__imagelist-item', 'sortable-list__item');
    el.dataset.url = url;
    el.dataset.source = source;
    el.dataset.deletehash = deletehash;

    el.innerHTML = `<span>
            <img src='/assets/icons/icon-grab.svg' data-grab-handle='' alt='grab'>
            <img class='sortable-table__cell-img' alt='Image' src='${escapeHtml(url)}' />
            <span>${escapeHtml(source)}</span>
          </span>
          <button type='button' data-delete-handle><img src='/assets/icons/icon-trash.svg' alt='delete'></button>`;
    return el;
  }
}
