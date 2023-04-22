import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  
  element; // DOM element
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };
  
  constructor (productId) {
    this.productId = productId;
  }
  
	
  onSubmit(event) {
    event.preventDefault();
    this.save();
  }
	
  /**
	 * метод для загрузки фото на imgur.com и получения ссылки на это фото
	 */
  uploadImg() {    
    const fileInputElem = document.createElement('input');
    fileInputElem.type = "file";
    fileInputElem.accept = 'image/*';
    fileInputElem.hidden = true;
    fileInputElem.click();
		
    // Создаем элемент input, обрабатываем ввод файла, отображаем в документе
    fileInputElem.addEventListener('change', async () => {
      const img = fileInputElem.files[0];
      if (img) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', img);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;
        document.body.append(fileInputElem);


        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });
				
        // отрисовываем загруженное фото
        imageListContainer.append(this.getImageItem(result.data.link, img.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // удаляем созданный ранее fileInputElem
        fileInputElem.remove();
      }
    });
  }
  
  

  /**
	 * Шаблон формы
	 */
  get template () {
    return `
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
            ${this.createImagesList()}
          </ul>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.createCategoriesSelect()}
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
    `;
  }
  
  /**
	 * отрисовка формы
	 */
  async render() {
		
    // получаем результаты fetch для категорий и данных формы продукта
    const categoriesPromise = this.loadCategories();
    // если продукта не было (не передан в конструкторе), то возвращаем дефолтную форму
    const productPromise = this.productId ? this.loadProductData(this.productId) : Promise.resolve([this.defaultFormData]);
		
    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productResponse;
		
    this.formData = productData;
    this.categories = categoriesData;
		
    // отрисовали форму
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();		

    // инициализировали лисенеры
    this.initListeners();
		
    // заполнили форму данными с сервера
    this.setForm();
		
    return this.element;

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
	
  
  setForm() {		
    const { productForm } = this.subElements;
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
		
    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);

      element.value = this.formData[item] || this.defaultFormData[item];
    });
  }
	
	
	
  initListeners() {
    const { productForm, uploadImage } = this.getSubElements();
    productForm.addEventListener('submit', (event) => this.onSubmit(event));
    uploadImage.addEventListener('click', () => this.uploadImg());
  }
	
	
  createImagesList () {
    return this.formData.images.map(item => {
      return this.getImageItem(item.url, item.source).outerHTML;
    }).join('');
  }
	
	
  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }
	
	
	
  async loadProductData (productId) {
    const productUrl = new URL("/api/rest/products", BACKEND_URL);
    productUrl.searchParams.set("id", productId);
    return await fetchJson(productUrl);
  }
	
  
  async loadCategories() {
    const categoriesUrl = new URL("/api/rest/categories", BACKEND_URL);
    categoriesUrl.searchParams.set("_sort", "weight");
    categoriesUrl.searchParams.set("_refs", "subcategory");
    return await fetchJson(categoriesUrl);
  }
	
	
	
  createCategoriesSelect() {
	
    const wrapper = document.createElement('div');
		
    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;
    const selectElem = wrapper.firstElementChild;
    let index = 0
    for (const category of this.categories) {
      category.subcategories.forEach(item => {
       selectElem[index] = new Option(category.title + ` > ` + item.title, item.id);
			 index++;
      });
    }
  
    return selectElem.outerHTML;
  }  
	
	
  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }
	
	
  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      throw new Error(error);
    }
  }

  getFormData () {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};
		
		
    for (const field of fields) {
      const value = getValue(field);
      values[field] = formatToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }
	
	
	
  destroy () {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
  
}
