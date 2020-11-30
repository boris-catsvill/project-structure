import SortableList from "../sortable-list"
import escapeHtml from '../../utils/escape-html.js'
import fetchJson from '../../utils/fetch-json.js'

const IMGUR_CLIENT_ID = '28aaa2e823b03b1'
const BACKEND_URL = 'https://course-js.javascript.ru'

export default class ProductForm {
  element = null
  subElements = {}
  defaultProductData = {
    title: '',
    description: '',
    status: 1,
    price: '',
    quantity: '',
    discount: '',
    images: [],
  }

  constructor(productId = '') {
    this.productId = productId
    this.categories = []
    this.productData = {}
  }

  async render() {
    const element = document.createElement('div')
    await this.fetchData()
    element.innerHTML = this.template
    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element)
    this.subElements.imageListContainer.append(this.getImageList(this.productData.images))
    this.initEventListeners()
    return this.element
  }

  async fetchData() {
    const categoriesPromise = this.fetchCategories()
    const productDataPromise = (this.productId)
      ? this.fetchProductData()
      : [this.defaultProductData]

    const [categoriesData, productData] = await Promise.all([categoriesPromise, productDataPromise])
    this.categories = categoriesData
    this.productData = productData[0]
  }

  fetchCategories = async () => {
    const categoriesURL = new URL('/api/rest/categories', BACKEND_URL)
    categoriesURL.searchParams.set('_sort', 'weight')
    categoriesURL.searchParams.set('_refs', 'subcategory')
    return fetchJson(categoriesURL)
  }

  fetchProductData = async () => {
    const productURL = new URL('/api/rest/products', BACKEND_URL)
    productURL.searchParams.set('id', this.productId)
    return fetchJson(productURL)
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', (e) => {
      e.preventDefault()
      if (this.productId)
        this.save()
      else
        this.create()
    })

    this.subElements.fileInput.addEventListener('change', this.uploadImage)
  }

  uploadImage = async (e) => {
    const formData = new FormData()
    formData.append('image', e.target.files[0], e.target.files[0].name)

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData,
    })

    if (response.status === 200) {
      const responseJson = await response.json()
      const url = responseJson.data.link
      const source = url.slice(url.lastIndexOf('/') + 1)
      this.productData.images.push({url, source})
      this.subElements.imageListContainer.innerHTML = ''
      this.subElements.imageListContainer.append(this.getImageList(this.productData.images))
    }
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input data-input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${escapeHtml(this.productData.title)}">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea data-input id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(this.productData.description)}</textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <label for="file-upload" class="button-primary-outline fit-content">Загрузить</label>
            <input id="file-upload" type="file" data-element="fileInput" accept="image/*" style="display: none;"/>
          </div>


          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select data-input class="form-control" name="subcategory" id="subcategory">
              ${this.getSubCategories(this.categories)}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input data-input id="price" required="" type="number" name="price" class="form-control" placeholder="100" value="${this.productData.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input data-input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.productData.discount}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input data-input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.productData.quantity}">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select data-input id="status" class="form-control" name="status">
              <option ${this.productData.status === 0 ? 'selected' : ''} value="0">Неактивен</option>
              <option ${this.productData.status === 1 ? 'selected' : ''} value="1">Активен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" class="button-primary-outline">
              ${(this.productId) ? 'Сохранить товар' : 'Cоздать'}
            </button>
          </div>
        </form>
      </div>`
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]')
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement
      return accum
    }, {})
  }

  getSubCategories(categoriesData) {
    const categories = []
    for (let category of categoriesData) {
      for (let subcategory of category.subcategories) {
        categories.push(`
            <option ${this.productData.subcategory === subcategory.id ? 'selected' : ''} value="${subcategory.id}">
              ${category.title} > ${subcategory.title}
            </option>`
        )
      }
    }
    return categories.join('')
  }

  getImageList(images) {

    const imageList = []

    images.forEach(image => {
      const listItem = document.createElement('div')
      listItem.innerHTML = `
             <li class="products-edit__imagelist-item">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
              <img src="/icon-grab.svg" data-grab-handle alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
              <span>${image.source}</span>
          </span>
          <button type="button">
              <img src="/icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
      </li>`
      imageList.push(listItem.firstElementChild)
    })
    return new SortableList({items: imageList}).element
  }

  readOutForm() {
    const inputElements = this.element.querySelectorAll('[data-input]')
    return [...inputElements].reduce((accum, input) => {
      accum[input.name] = input.value
      return accum
    }, {})
  }

  async create() {
    const createProductURL = new URL('/api/rest/products', BACKEND_URL)
    const response = await fetchJson(createProductURL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.readOutForm())
    })
    this.element.dispatchEvent(new CustomEvent('product-saved', {
      bubbles: true,
      detail: 'New product created'
    }))
  }

  async save() {
    const updateProductURL = new URL('/api/rest/products', BACKEND_URL)
    const formValues = this.readOutForm()
    const response = await fetchJson(updateProductURL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formValues)
    })

    this.element.dispatchEvent(new CustomEvent('product-updated', {
      bubbles: true,
      detail: 'Product updated'
    }))
  }

  remove() {
    this.element.remove()
  }

  destroy() {
    this.remove()
    this.element = null
    this.subElements = {}
  }
}
