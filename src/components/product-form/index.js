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
    images: [],
    price: 100,
    discount: 0
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.hidden = true;
    document.body.append(fileInput);

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

        try {
          const result = await fetchJson('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
            },
            body: formData
          });
  
          const imagesList = imageListContainer.querySelector('ul.sortable-list');

          imagesList.append(this.renderImageItem({
            url: result.data.link,
            source: file.name
          }));
        } catch(error) {
          console.error('Ошибка при загрузке изображения!', error);
        }  

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    fileInput.click();
  }

  constructor(productId) {
    this.productId = productId;
  }

  get getProductForm() {
    return `
      <div class="product-form">

        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара" data-element="productName">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" id="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory" data-element="productCategory"></select>
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" data-element="productPrice">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" data-element="productDiscount">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1" data-element="productQuantity">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status" data-element="productStatus">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" id="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>          
        </form>
      </div>
    `;
  }

  get getSubElements() {
    const subElements = this.element.querySelectorAll('[data-element]');

    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  async render() {
    const categories = this.getCategories();

    const productData = this.productId ?
      this.getProductData(this.productId) :
      [this.defaultFormData];

    const [categoriesData, productResponse] = await Promise.all([categories, productData]);
    const [productInfo] = productResponse;

    this.categories = categoriesData;
    this.formData = productInfo;

    const element = document.createElement('div');
    element.innerHTML = this.getProductForm;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements;

    this.addCategories(this.categories);
    this.addImages(this.formData.images);
    this.updateForm();

    this.addEventListeners();

    return this.element;
  }

  async getProductData(productId) {
    const url = new URL(`${process.env.DATA_API}/products`, process.env.BACKEND_URL);
    url.searchParams.set(`id`, productId);

    return fetchJson(url.href);
  }

  async getCategories() {
    const url = new URL(`${process.env.DATA_API}/categories`, process.env.BACKEND_URL);
    url.searchParams.set(`_sort`, `weight`);
    url.searchParams.set(`_refs`, `subcategory`);

    return fetchJson(url.href);
  }

  async save() {
    const formData = this.getFormData();

    const result = await fetchJson(`${process.env.BACKEND_URL}${process.env.DATA_API}/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const event = this.productId ?
      new CustomEvent('product-updated', {
        detail: result.id
      }) :
      new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const data = {};

    data.images = [];
    data.id = this.productId;

    for (const field of fields) {
      const dataItem = productForm.querySelector(`[name=${field}]`).value;

      data[field] = formatToNumber.includes(field) ?
        parseInt(dataItem) :
        dataItem;
    }

    const images = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    for (const image of images) {
      data.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return data;
  }

  addImages(images = []) {
    const sortableList = new SortableList({
      items: images.map(image => this.renderImageItem(image))
    });

    this.subElements.imageListContainer.append(sortableList.element);
  }

  renderImageItem({ source, url }) {
    const image = document.createElement('div');

    image.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${escapeHtml(url)}">
        <input type="hidden" name="source" value="${escapeHtml(source)}">
        <span>
          <img src="../icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="../icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
        </span>
      </li>
    `;

    return image.firstElementChild;
  }

  addCategories(categories = []) {
    const subcategory = this.subElements.productCategory;

    categories.forEach(({ title: categoryTitle, subcategories }) => {
      subcategories.forEach(({ id, title }) => {
        subcategory.append(new Option(`${categoryTitle} > ${title}`, id));
      });
    });
  }

  updateForm() {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));

    fields.forEach(field => {
      const element = productForm.querySelector(`#${field}`);

      element.value = this.formData[field] || this.defaultFormData[field];
    });
  }

  addEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);

    imageListContainer.addEventListener('click', event => {
      if (event.target.dataset.deleteHandle === '') {
        event.target.closest('li').remove();
      }
    })
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  remove() {
    this.element.remove();
  }
}
