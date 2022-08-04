import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

export default class ProductForm {

  defaultFormData = {
      title: '',
      description: '',
      quantity: 1,
      subcategory: '',
      status: 1,
      rating: null,
      images: [],
      price: 100,
      discount: 0
  };

  constructor(productId) {
      this.productId = productId;
  }

  addSortableList() {
      const sortableList = this.element.querySelector('.sortable-list')
      const sortable = new SortableList({}, sortableList)
  }

  async render() {
      const categoriesPromise = this.loadCategories()
      const productPromise = this.productId ? this.loadData(this.productId) : Promise.resolve(this.defaultFormData)

      const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
      let productData = productResponse
      Array.isArray(productData) ? productData = productResponse[0] : ''

      this.data = productData
      this.categories = categoriesData

      this.element = this.createTemplate()
      this.subElements = this.getSubElements(this.element)

      if (this.data) {
          this.fillElement(this.data) // заполняются сразу
          this.initEventListeners()
      }
      return this.element
  }

  fillElement(data) {
      this.form = this.element.querySelector('form')
      this.fillForm(this.form, data)
      this.fillImages(this.data.images)
      this.addSortableList()
  }

  async loadData(id) {
      return await fetchJson((`${process.env.BACKEND_URL}api/rest/products?id=${id}`))
  }

  async loadCategories() {
      return await fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`)
  }

  fillCategories(categories) {
      const select = this.createElement(`<select class="form-control" id="subcategory" name="subcategory"></select>`)
      for (const category of categories) {
          category.subcategories.forEach(item => {
              select.append(this.createElement(`<option value=${item.id}>${category.title} &gt; ${item.title}</option>`))
          })
      }
      return select.outerHTML
  }

  fillForm(form, obj) {
      for (let key of Object.keys(obj)) {

          if (form.elements[key]) {
              form.elements[key].value = obj[key] // заполняем формы значениями ключей объекта
          }
      }
  }

  fillImages(arr) {
      let sortableList = this.element.querySelector('.sortable-list')
      arr.forEach(item => {
          sortableList.append(this.createElement(`
          <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value=${(item.url)}>
        <input type="hidden" name="source" value=${item.source}>
        <span>
      <img src="icon-grab.svg" data-grab-handle="" alt="grab">
      <img class="sortable-table__cell-img" alt="Image" src=${item.url}>
      <span>${item.source}</span>
      </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
      `))
      })

  }

  initEventListeners() {
      const { productForm, uploadImage } = this.subElements;

      productForm.addEventListener('submit', this.onSubmit)
      uploadImage.addEventListener('click', this.uploadImage)
  }

  onSubmit = event => {
      event.preventDefault();

      this.save();
  };

  async save() {
      const product = this.getProduct()

      try {
          const result = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
              method: this.productId ? 'PATCH' : 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(product)
          });

          this.dispatchEvent(result.id);
      } catch (error) {
          console.error('something went wrong', error);
      }

  }

  dispatchEvent(id) {
      let customizedEvent;
      if (this.productId) {
          customizedEvent = new CustomEvent('product-updated', { detail: id })
      } else {
          customizedEvent = new CustomEvent('product-saved')
      }
      this.element.dispatchEvent(customizedEvent);
  }

  getProduct() {
      const product = this.data
      const formatToNumber = ['price', 'quantity', 'discount', 'status']

      for (let key of Object.keys(product)) {
          if (this.form.elements[key]) {
              product[key] = formatToNumber.includes(key) ? +this.form.elements[key].value : this.form.elements[key].value
          }
      }
      return product
  }

  getSubElements(element) {
      this.subElements = {};
      const elements = element.querySelectorAll('[data-element]');
      for (let element of elements) {
          this.subElements[element.dataset.element] = element;
      }
      return this.subElements;
  }

  createElement(html) {
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.firstElementChild;
  }

  uploadImage = () => {
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

              const imgArray = [{ url: result.data.link, source: file.name }]
              this.fillImages(imgArray)

              uploadImage.classList.remove('is-loading');
              uploadImage.disabled = false;
              fileInput.remove();
          }
      });

      fileInput.hidden = true;
      document.body.append(fileInput);

      fileInput.click();
  };


  createTemplate() {
      return this.createElement(
          `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              id="title"
              value=""
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required
            id="description"
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>
          <ul class="sortable-list" data-element="imageListContainer">
    
          </ul>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.fillCategories(this.categories)}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required
              id="price"
              value=""
              type="number"
              name="price"
              class="form-control"
              placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required
              id="discount"
              value=""
              type="number"
              name="discount"
              class="form-control"
              placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required
            id="quantity"
            value=""
            type="number"
            class="form-control"
            name="quantity"
            placeholder="${this.defaultFormData.quantity}">
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
    `)

  }

  remove() {
      this.element.remove();
  }

  destroy() {
      this.remove();
      this.element = null;
      this.subElements = {};
  }

}