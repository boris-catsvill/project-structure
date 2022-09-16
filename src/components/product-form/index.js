import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import pick from '../../utils/pick.js'

export default class ProductForm {
  element;
  subElements = {};
  product = {};
  categories = [];
  defaulFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  onFormSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  onImageChoose = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file",
    fileInput.accept = "image/*",
    fileInput.addEventListener('change', async (event) => {
      const [input] = event.path;
      const [image] = input.files;
      if (!image) return;
  
      const imageFormData = new FormData();
      imageFormData.append('image', image);

      try {
        const result = await fetchJson(process.env.IMGUR_URL, {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          },
          body: imageFormData,
          referrer: ''
        });
        this.sortableList.addItem(this.getImageElement(escapeHtml(image.name), escapeHtml(result.data.link)));  
      } catch (error) {
          throw new Error(`Unable to upload picture to ${process.env.IMGUR_URL}. Details: ${error}`);
      }
    });

    fileInput.click();
  }

  constructor (productId) {
    this.productId = productId;
    this.url = {product : new URL(`/api/rest/products`, process.env.BACKEND_URL),
                categories : new URL(`/api/rest/categories`, process.env.BACKEND_URL)};
  }

  getCategoryElements() {
    return this.categories.map(category => 
      category.subcategories.map(subcategory => 
        this.renderCategoryElement(category.id, category.title, subcategory.title))
    ).join('');
  }

  renderCategoryElement(id, categoryTitle, subcategoryTitle) {
    return `<option value="${id}">${categoryTitle} &gt; ${subcategoryTitle}</option>`;
  }

  getImageElement(source, url) {
    const element = document.createElement('div');
    element.innerHTML = this.renderImageElement(source, url);
    return element.firstElementChild;
  }

  renderImageElement(source, url) {
    return `<li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            </div>
              <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory">
            </select>
          </div>
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
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId? 'Сохранить товар' : 'Добавить товар'}
            </button>
          </div>
        </form>
      </div>
    `;
  }

  get productNotFound() {
    const element = document.createElement("div");
    element.innerHTML = `<h1 class="page-title">Page not found</h1><p>Sorry, product with such ID does not exist</p>`;
    return element;
  }

  updateFormElements() {
    this.subElements.productForm.elements.subcategory.innerHTML = this.getCategoryElements();
    this.subElements.imageListContainer.append(this.sortableList.element);
    
    for (const elem of this.subElements.productForm.elements) {
      const name = elem.getAttribute('name');
      if (this.product[name]) {
        elem.value = this.product[name];
      }
    }     
  }

  async render () {
    await this.loadData(this.productId);
    
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    if(this.productId && !this.product) return this.productNotFound;

    this.sortableList = new SortableList({items: this.product.images.map(image => this.getImageElement(image.source, image.url))});

    this.updateFormElements();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    const {productForm} = this.subElements;
    productForm.addEventListener('submit', this.onFormSubmit);
    productForm.elements.uploadImage.addEventListener("pointerdown", this.onImageChoose);
  }

  fetchProduct(productID) {
    const urlProduct = new URL(this.url.product);
    urlProduct.searchParams.set('id', productID); 

    return (this.productId) ? 
      fetchJson(urlProduct).then(product => product[0]).catch( error => console.error(error)) :
      Promise.resolve(this.defaulFormData);
  }

  fetchCategories() {
    const urlCategories = new URL(this.url.categories);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');

    return fetchJson(urlCategories).catch( error => console.error(error));
  }

  async loadData(productID) {
    try {
      return [this.categories, this.product] = await Promise.all([this.fetchCategories(), this.fetchProduct(productID)]);
    } catch(error) {
      throw new Error(`Unable to fetch data from ${this.url.product} or ${this.url.categories}`);
    }
  }

  async save() {
    const productDataToSend = this.getProductToSave();

    try {
      const res = await fetchJson(this.url.product, {
        method: (this.productId)? 'PATCH' : 'PUT',
        body: JSON.stringify(productDataToSend),
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        }
      });
      this.element.dispatchEvent(new CustomEvent(this.productId? 'product-updated' : 'product-saved', {
        bubbles: true,
        detail: {
         id: res.id
        }}));
    } catch(error) {
      throw new Error(`Unable to save product data on server`);
    } 
  }

  getProductToSave() {
    const formEntries = Object.fromEntries(new FormData(this.subElements.productForm));
    const productDataToSave = pick(formEntries, ...Object.keys(this.defaulFormData));
    productDataToSave.id = this.productId;
    productDataToSave.images = [];    

    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    for (const field of Object.keys(productDataToSave)) {
      const value = productDataToSave[field];
      productDataToSave[field] = formatToNumber.includes(field)? parseInt(value): value;
    }

    const imagesHTMLCollection = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');
    for (const image of imagesHTMLCollection) {
      productDataToSave.images.push({
        url: image.src,
        source: image.nextElementSibling.textContent
      });
    }

    return productDataToSave;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if(this.element) {
      this.element.remove();  
    }
  }
    
  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}