import NotificationMessage from '../notification/index.js';
import SortableList from '../sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';
import ImageUploader from '../../utils/image-uploader.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

const Uploader = new ImageUploader(IMGUR_CLIENT_ID);

const CATEGORIES_URL = `${ BACKEND_URL }/api/rest/categories?_sort=weight&_refs=subcategory`;

const NUMBER_FIELDS = ['price', 'discount', 'status', 'quantity'];


export default class ProductForm {
  element = null;
  subElements = {};

  onFileUploadClick = (ev) => {
    ev.preventDefault();
    this.subElements.fileInput.click();
  };

  onSubmit = (ev) => {
    ev.preventDefault();
    this.save();
    return false;
  };

  uploadFile = async () => {
    try {
      const [file] = this.subElements.fileInput.files;
      // фотки в имгур не грузятся, поэтому отдаём статичные
      // Ошибка: error: "Imgur is temporarily over capacity. Please try again later."
      // const result = await Uploader.upload(file);
      const result = [{
        source: '101-planset-lenovo-tab-e10-tb-x104l-32-gb-3g-lte-cernyj-8.jpg',
        url: 'https://shop-image.js.cx/101-planset-lenovo-tab-e10-tb-x104l-32-gb-3g-lte-cernyj-8.jpg'
      }];

      this.productValues.images = this.productValues.images.concat(result);

      this.updateImages(this.productValues.images);
    } catch (error) {
      alert('Ошибка загрузки изображения');
      console.error(error);
    }
  };

  constructor(productId) {
    this.productId = productId;
    this.isEdit = !!this.productId;
    this.productValues = {
      images: []
    };
    this.fields = {};
    this.isLoadingProduct = false;
    this.isLoadingCategories = false;
    this.categories = [];

    this.createForm();
    this.render();
  }

  getImageTemplate({ url, source }) {
    return `<li class='products-edit__imagelist-item sortable-list__item'>
               <input type='hidden' name='image.url' value='${ url }'>
               <input type='hidden' name='image.source' value='${ source }'>
               <span>
               <img src='assets/icons/icon-grab.svg' data-grab-handle='' alt='grab'>
               <img class='sortable-table__cell-img' alt='Image' src='${ url }'>
               <span>${ source }</span>
               </span>
               <button type='button'>
               <img src='assets/icons/icon-trash.svg' data-delete-handle='' alt='delete'>
               </button>
            </li>`;
  }

  get template() {
    return `<form data-element='productForm' class='form-grid'>
   <div class='form-group form-group__half_left'>
      <fieldset>
         <label class='form-label'>Название товара</label>
         <input required='' type='text' name='title' class='form-control' placeholder='Название товара'>
      </fieldset>
   </div>
   <div class='form-group form-group__wide'>
      <label class='form-label'>Описание</label>
      <textarea required='' class='form-control' name='description' data-element='productDescription' placeholder='Описание товара'></textarea>
   </div>
   <div class='form-group form-group__wide' data-element='sortable-list-container'>
      <label class='form-label'>Фото</label>
      <div data-element='imageListContainer'>
         <ul class='sortable-list'></ul>
      </div>
       <input data-element='fileInput' type='file' style='display: none'>
      <button type='button' name='uploadImage' data-element='uploadButton' class='button-primary-outline' ><span>Загрузить</span></button>
   </div>
   <div class='form-group form-group__half_left'>
      <label class='form-label'>Категория</label>
      <select class='form-control' name='subcategory' id='subcategory'>
      </select>
   </div>
   <div class='form-group form-group__half_left form-group__two-col'>
      <fieldset>
         <label class='form-label'>Цена ($)</label>
         <input required='' type='number' name='price' class='form-control' placeholder='100'>
      </fieldset>
      <fieldset>
         <label class='form-label'>Скидка ($)</label>
         <input required='' type='number' name='discount' class='form-control' placeholder='0'>
      </fieldset>
   </div>
   <div class='form-group form-group__part-half'>
      <label class='form-label'>Количество</label>
      <input required='' type='number' class='form-control' name='quantity' placeholder='1'>
   </div>
   <div class='form-group form-group__part-half'>
      <label class='form-label'>Статус</label>
      <select class='form-control' name='status'>
         <option value='1'>Активен</option>
         <option value='0'>Неактивен</option>
      </select>
   </div>
   <div class='form-buttons'>
      <button type='submit' name='save' class='button-primary-outline'>
      Сохранить товар
      </button>
   </div>
</form>`;
  }

  getFormValues() {
    const result = {};

    const formData = new FormData(this.subElements.productForm);

    for (let [fieldName, value] of formData.entries()) {
      if (fieldName !== 'image.source' && fieldName !== 'image.url') {
        if (NUMBER_FIELDS.includes(fieldName)) {
          result[fieldName] = Number(value);
        } else {
          //todo пробовала использоваать escapeHTML, но строка сохранилась в виде:
          // 13.3&quot; Чехол Riva 8903
          // и потом так же отрендерилась
          result[fieldName] = value;
        }
      }
    }

    const imageURLs = formData.getAll('image.url');
    const imageSources = formData.getAll('image.source');

    if (imageURLs.length) {
      if (this.isEdit) {
        result.images = imageURLs.map((url, index) => ({
          source: imageSources[index],
          url
        }));
      }
    }


    return result;
  }

  addEventListeners() {
    this.subElements.productForm.onsubmit = this.onSubmit;
    this.subElements.uploadButton.onclick = this.onFileUploadClick;
    this.subElements.fileInput.addEventListener('change', this.uploadFile);
  }

  showLoading() {
    this.subElements.productForm.style.display = 'none';
    this.subElements.loading.style.display = 'block';
  }

  hideLoading() {
    this.subElements.productForm.style.display = 'block';
    this.subElements.loading.style.display = 'none';
  }

  hideLoadingIfNeeded() {
    //Убираем лоадинг, если у нас завершились оба запроса - получение продукта и получение категорий
    if (!this.isLoadingProduct && !this.isLoadingCategories) {
      this.hideLoading();
    }
  }

  loadProductData() {
    this.isLoadingProduct = true;
    return fetchJson(`${ BACKEND_URL }/api/rest/products?id=${ this.productId }`)
      .then((dataArr) => {
        this.isLoading = false;

        if (dataArr.length) {
          this.productValues = dataArr.length ? dataArr[0] : {};
          this.setFormValues();
        }
      })
      .catch((err) => {
        console.log('Ошибка получения данных продукта');
      })
      .finally(() => {
        this.isLoadingProduct = false;
        this.hideLoadingIfNeeded();
      });
  }

  loadCategories() {
    this.isLoadingCategories = true;
    return fetchJson(CATEGORIES_URL)
      .then(categories => {
        // Собираем список подкатегорий с категориями
        const options = categories.reduce((accumulator, { title: categoryTitle, subcategories }) => {
          const subcategoriesArr = Array.isArray(subcategories) ? subcategories.map(({ id, title }) => ({
            id,
            title: `${ categoryTitle } > ${ title }`
          })) : [];

          return accumulator.concat(subcategoriesArr);
        }, []);

        this.fields.subcategory.innerHTML = options.map(({ id, title }) => (
          `<option value='${ id }'>${ title }</option>`))
          .join('');

        if (this.productValues.subcategory) {
          this.fields.subcategory.value = this.productValues.subcategory;
        }
      })
      .catch((err) => {
        console.log('Ошибка получения списка категоий', err);
      })
      .finally(() => {
        this.isLoadingCategories = false;
        this.hideLoadingIfNeeded();
      });
  }

  async save() {
    this.showLoading();
    const formValues = this.getFormValues();

    if (this.isEdit) {
      formValues.id = this.productId;
    }

    return fetchJson(`${ BACKEND_URL }/api/rest/products`, {
      method: this.isEdit ? 'PATCH' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues)
    })
      .then(({ id }) => {
        const successEvent = new CustomEvent(this.isEdit ? 'product-updated' : 'product-save', {
          productId: id
        });

        this.element.dispatchEvent(successEvent);
        const notification = new NotificationMessage('Изменения сохранены.', {
          duration: 2 * 1000
        });

        notification.show();
      })
      .catch(error => {
        const notification = new NotificationMessage('Не удалось сохранить изменения', {
          type: 'error',
          duration: 2 * 1000
        });

        notification.show();
      })
      .finally(() => {
        this.hideLoading();
      });
  }

  createForm() {
    const container = document.createElement('div');
    container.innerHTML = `<div class='product-form'>
      <div data-element='loading' class='loading-line sortable-table__loading-line'></div>
      ${ this.template }
       </div>`;

    this.element = container.firstElementChild;

    const fields = this.element.querySelectorAll('[name]');
    fields.forEach(field => {
      this.fields[field.name] = field;
      field.id = field.name;
    });

    this.fields.imageListContainer = this.element.querySelector('[data-element="imageListContainer"]');

    const components = this.element.querySelectorAll('[data-element]');

    components.forEach(component => {
      this.subElements[component.dataset.element] = component;
    });

    this.addEventListeners();
  }

  setFormValues() {
    Object.entries(this.productValues).forEach(([fieldName, value]) => {
      const { [fieldName]: formField } = this.fields;
      if (formField) {
        formField.value = value;
      }
    });

    this.updateImages(this.productValues.images);
  }

  updateImages(imagesList = []) {
    if (!imagesList.length) {
      return;
    }

    if (this.fields.imageListContainer.firstElementChild) {
      this.fields.imageListContainer.firstElementChild.remove();
    }

    const container = document.createElement('div');
    const sortableList = new SortableList({
      items: imagesList.map((imageData) => {
        container.innerHTML = this.getImageTemplate(imageData);
        return container.firstElementChild;
      })
    });

    this.fields.imageListContainer.append(sortableList.element);
  }

  async render() {
    this.showLoading();

    this.loadCategories();
    if (this.isEdit) {
      this.loadProductData();
    }

    return this.element;
  }

  destroy() {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }

    this.subElements = {};
  }

  remove() {
    this.destroy();
  }
}


