import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  // events
  evntSignal; //AbortController.signal

  //rendering
  element;
  viewName = 'ProductForm';
  subElements = {};
  subStructural = ['productForm', 'imageListContainer']
  imageList; // [HTML,...];

  //toolbar buttons
  toolbar = {};  

  // async markers
  asyncInLoading = false;

  //local data
  viewModel;// = {};  
  defaultData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  //backend data
  oModel; // {}

  backendURLEntitySet = '/api/rest/products';
  entitySet = 'ProductSet';

  backendURLCategory = '/api/rest/categories';
  categorySet = 'CategorySet';  

  onProductSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  onImageDelete = (event) => {
    const listId = event.detail.item.dataset.listId;
    if (!listId) { return; }

    const viewModel = this.getViewModel();
    viewModel.product.images = viewModel.product.images.filter((item) => {
      if (item.source !== listId) {return item;}
    }); 
  }

  onImageLoad = (event) => {
    // ToDO можно подумать над реюзом
    const elem = document.createElement("input");
    elem.type = "file";
    elem.accept = "image/*";
    elem.onchange = async()=>{
      const selectedFile = elem.files[0];
      if (!selectedFile) {return;}
            
      const fileForm = new FormData();
      fileForm.append("image", selectedFile);

      this.subElements.productForm.uploadImage.classList.add("is-loading");
      this.subElements.productForm.uploadImage.disabled = true;
      try {
        const ImageReqData = await fetch("https://api.imgur.com/3/image", {
          method: "POST",
          headers: { //"Client-ID 28aaa2e823b03b1"
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: fileForm
        });
        const result = await ImageReqData.json();
        this.imageList.addItem(this.renderImageListItem({
          url: result.data.link,
          source: selectedFile.name
        }));        
      } catch (err) {
        if (!(err instanceof FetchError)) {throw err;}
        console.log("Upload error: " + err.message);
      } finally {
        this.subElements.productForm.uploadImage.classList.remove("is-loading");
        this.subElements.productForm.uploadImage.disabled = false;

        elem.remove();
      }
    };

    elem.hidden = true;
    document.body.appendChild(elem);
    elem.click();    
  }  

  constructor (productId) {
    this.productId = productId;

    this.oModel = this.getJSONModel(); //backend data
    this.viewModel = this.getViewModel();
  }

  async render () {

    this.asyncInLoading = true;
    await this.loadData();
    this.asyncInLoading = false;      

    this.rerender();
    return this.element;
  }

  getJSONModel() {
    if (!this.oModel) {
      this.oModel = {};
    }
    return this.oModel;
  }

  updateJSONModel(jsonBackend) { //[{'id': {}}...]
    // dummy
  }

  getViewModel() {
    if (!this.viewModel) {
      this.viewModel = {};
    }
    return this.viewModel;
  }

  getEntKey(entKey) {
    if (typeof entKey === 'string') {
      return entKey;
    }
  }

  async save() {
    this.transferToModel(this.viewModel.product);
    await this.commitChanges(this.viewModel.product);
  }

  dispatchEvent(name = 'custom-event', message) {
    this.element.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: message
    }));
  }

  omitObjectFields(obj, ...fields) {
    const resObj = {};

    const arKeys = Object.keys(obj);
    arKeys.forEach(element => {
      if (!fields.includes(element)) {
        resObj[element] = obj[element];
      }          
    });
    return resObj;
  }

  async commitChanges(changesModel) {
    const url = new URL(this.backendURLEntitySet, BACKEND_URL);
    let prodData = this.omitObjectFields(changesModel, 'brand', 'characteristics', 'rating');
    prodData.quantity = +prodData.quantity;
    prodData.status = +prodData.status;
    prodData.price = +prodData.price;
    prodData.discount = +prodData.discount;

    prodData = JSON.stringify(prodData);

    const response = await fetch(url.href, {
      method: (!this.productId) ? "PUT" : "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: prodData 
    });
    
    if (response.status !== 200) {
      console.log('Data Saving error');
      return;
    }
    const result = await response.json();

    if (this.productId) {
      this.dispatchEvent('product-updated', this.productId);
    } else {
      this.dispatchEvent('product-saved', changesModel.productId);
      this.updateJSONModel(result.message);
    }
  }

  async loadData() {
    const categoryPromise = this.loadCategories();
    
    const productPromise = this.productId 
      ? this.loadProduct()
      : Promise.resolve(this.defaultData);

    try {
      const [categData, prdData] = await Promise.all([
        categoryPromise, productPromise]);
    
      this.viewModel.product = prdData[0];
      this.viewModel.categories = categData;

      // save as OData entity
      let key = this.getEntKey(this.entitySet); //'productES' + this.productId;
      if (!this.oModel[key]) {
        this.oModel[key] = {};
      }      
      if (prdData && prdData.length && this.productId) {
        prdData.map((item) => { this.oModel[key][item.id] = item; });
      
      } else if (this.oModel[key][this.productId]) {
        delete this.oModel[key][this.productId];
      }    
    
      key = this.getEntKey(this.categorySet); 
      if (!this.oModel[key]) {
        this.oModel[key] = {};
      }
      categData.map((item) => { this.oModel[key][item.id] = item; });
    } catch (error) {
      console.log('loading error');
    }    
  }

  async loadProduct() {
    const url = new URL(this.backendURLEntitySet, BACKEND_URL);

    url.searchParams.set('id', this.productId);
    return await fetchJson(url);
  }

  async loadCategories() {
    // 
    const url = new URL(this.backendURLCategory, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async update(productId) {
    this.productId = productId;

    this.rerender();
  }

  transferToModel(model) { // = {}
    //productForm;
    for (const [elemKey, elemHtml] of Object.entries(this.subElements)) {
      if (!this.subStructural.includes(elemKey)) {
        model[elemKey] = elemHtml.value;
      }
    }
    model.images = this.transferImagesData();
  }

  transferImagesData() {
    const img = [];
    const dataArray = Array.from(new FormData(this.subElements.productForm))
      .filter((elem) => {return "url" === elem[0] || "source" === elem[0];});

    for (let i = 0; i < dataArray.length; i++) {
      img.push({ url: dataArray[i][1], source: dataArray[i + 1][1]});
      i++;
    }
    return img;
  }

  rerender() {
    // replace data in this.subElements too hard for the simple task, 
    // let's draw brand new (no listeners activated);
    if (!this.element) {
      const element = document.createElement("div");
      element.innerHTML = this.getTemplate();
      this.element = element.firstElementChild;
    } else {
      this.element.innerHTML = this.getTemplate();
    }   

    this.subElements = this.getSubelements();

    this.subElements.imageListContainer.append(this.imageList.element);
     
    this.toolbar = this.getToolbar();
    this.initEventListeners();  
    // но по-хорошему надо выяснять тип у елемента в this.subElements 
    // и перестраивать только его (чтобы не сбивать подписку на события)
  }

  getToolbar() {
    const result = {};
    const elems = this.element.querySelectorAll("[data-toolbar]");

    for (const simpleElem of elems) {
      const name = simpleElem.dataset.toolbar; //dataset.element;
      // в элементе хранится тип и привязка к модели, так что отдельные атрибуты не делаем
      result[name] = simpleElem; 
    }    
    return result;
  }

  getSubelements() {
    const result = {};
    const elems = this.element.querySelectorAll(".form-control");
    for (const simpleElem of elems) {
      const name = simpleElem.name; 
      // в элементе хранится тип и привязка к модели, так что отдельные атрибуты не делаем
      result[name] = simpleElem; 
    }

    let els = this.element.querySelectorAll("[data-element]"); 
    for (const simpleElem of els) {
      if (simpleElem.dataset.element === "productForm") {
        result.productForm = simpleElem;
      }
      if (simpleElem.dataset.element === "imageListContainer") {
        result.imageListContainer = simpleElem;
      }
    }
    return result;
  }

  getElementValue(option = {}) {
    if (option['data-model']) {
      return (this.viewModel.product)
        ? this.viewModel.product[option['data-model']]
        : undefined;
    }  
  }

  renderLebel(label) {
    return `<label class="form-label">${label}</label>`;
  }

  renderInput(name, type = "text", option = {}, model = {}) {
    const elemArray = [];
    let elemVal = this.getElementValue(model);
    elemVal = elemVal ? escapeHtml(elemVal.toString()) : '';
    elemArray.push(`<input class="form-control" id="${name}" type="${type}" name="${name}" 
      value="${elemVal}"`);

    for (const [key, value] of Object.entries(option)) {
      elemArray.push(`${key}="${value}"`);
    } 
    for (const [optKey, optValue] of Object.entries(model)) {
      elemArray.push(`${optKey}="${optValue}"`);
    }
    elemArray.push(`>`);
    
    return elemArray.join(' ');
  }

  renderTextArea(name, option = {}, model = {}) {
    const elemArray = [];
    let elemVal = this.getElementValue(model);
    elemVal = elemVal ? escapeHtml(elemVal.toString()) : '';
    elemArray.push(`<textarea class="form-control" name="${name}" id="${name}"`);

    for (const [key, value] of Object.entries(option)) {
      elemArray.push(`${key}="${value}"`);
    }
    for (const [optKey, optValue] of Object.entries(model)) {
      elemArray.push(`${optKey}="${optValue}"`);
    }       
    elemArray.push(`>${elemVal}</textarea>`);
    return elemArray.join(' ');
  }

  renderSelect(name, options = {}, model = {}) {
    const elemArray = [];
    elemArray.push(`<select class="form-control" name="${name}" id="${name}"`);

    for (const [optKey, optValue] of Object.entries(options)) {
      elemArray.push(`${optKey}="${optValue}"`);
    }    
    for (const [optKey, optValue] of Object.entries(model)) {
      elemArray.push(`${optKey}="${optValue}"`);
    } 
    elemArray.push(`>`);
    let selectedValue = this.getElementValue(model);
    selectedValue = selectedValue ? escapeHtml(selectedValue.toString()) : '';
    
    for (const [optKey, optValue] of Object.entries(options)) {
      elemArray.push(`<option value="${optKey}" ${selectedValue === optKey ? 'selected' : ''}>
        ${escapeHtml(optValue.toString())}</option>`);
    }
    elemArray.push(`</select>`);

    return elemArray.join(' ');
  }

  renderImageContainer(name, option = {}, model = {}) {
    const elemArray = [];
    if (option.lebel) {
      elemArray.push(`${this.renderLebel(option.lebel)}`);
    }
    elemArray.push(`<div data-element="imageListContainer">`);
    const imageArray = this.getElementValue(model);
    this.imageList = new SortableList({ items: imageArray.map(singlePhoto => {
      return this.renderImageListItem({ url: singlePhoto.url, source: singlePhoto.source });
    })});
    
    elemArray.push(`</div>`);
    if (option.addButton) {
      elemArray.push(`<button type="button" name="uploadImage" 
        class="button-primary-outline fit-content"
        data-toolbar="imageLoad"><span>${option.addButton}</span></button>`);
    }
    return elemArray.join(' ');     
  }

  renderImageListItem({ url: objLink, source: objSource }) {
    const element = document.createElement('li');
    element.classList.add("products-edit__imagelist-item");
    element.style = "";
    element.dataset.listId = `${objSource}`;

    element.innerHTML = `
    <input type="hidden" name="url" value="${objLink}">
    <input type="hidden" name="source" value="${objSource}">
    <span>
      <img src="icon-grab.svg" data-grab-handle="" alt="grab">
      <img class="sortable-table__cell-img" alt="Image" src="${objLink}">
      <span>${objSource}</span>
    </span>
    <button type="button">
      <img src="icon-trash.svg" data-delete-handle="" alt="delete">
    </button>`;
    return element;
  }

  getTemplate() {
    return `<div class="product-form">
  <form data-element="productForm" class="form-grid">
    <div class="form-group form-group__half_left">
      <fieldset>
        ${this.renderLebel("Название товара")}
        ${this.renderInput("title", "text", { placeholder: "Название товара" },
    { 'data-model': 'title'})}
      </fieldset>
    </div>
    <div class="form-group form-group__wide">
      ${this.renderLebel("Описание")}
      ${this.renderTextArea("description", { placeholder: "Описание товара", 
    'data-element': "productDescription"},
  { 'data-model': "description" })}
    </div>
    <div class="form-group form-group__wide" data-element="sortable-list-container">
      ${this.renderImageContainer("images", {lebel: "Фото", addButton: 'Загрузить'}, {'data-model': "images" })}
    </div>
    <div class="form-group form-group__half_left">
      ${this.renderLebel("Категория")}
      ${this.renderSelect('subcategory', this.getPlainSubcategories(),
    {'data-model': "subcategory" })}
    </div>
    <div class="form-group form-group__half_left form-group__two-col">
      <fieldset>
        ${this.renderLebel("Цена ($)")}
        ${this.renderInput("price", "number", { placeholder: "100"},
    { 'data-model': "price" })}
      </fieldset>
      <fieldset>
        ${this.renderLebel("Скидка ($)")}
        ${this.renderInput("discount", "number", { placeholder: "0"},
    { 'data-model': "discount" })}
      </fieldset>
    </div>
    <div class="form-group form-group__part-half">
      ${this.renderLebel("Количество")}
      ${this.renderInput("quantity", "number", { placeholder: "1"},
    { 'data-model': "quantity"})}
    </div>
    <div class="form-group form-group__part-half">
      ${this.renderLebel("Статус")}
      ${this.renderSelect('status', this.getStatusValues(),
    {'data-model': "status" })}
    </div>
    <div class="form-buttons">
      <button type="submit" name="save" class="button-primary-outline" 
        data-toolbar="submit">
        Сохранить товар
      </button>
    </div>
  </form>
</div>`;
  }

  getStatusValues() {
    return { "1": 'Активен', "0": 'Неактивен'};
  }

  getPlainSubcategories() {
    const subcatsList = {};
    if (this.viewModel.categories) {
      for (const [catId, catValue] of Object.entries(this.viewModel.categories)) {
        catValue.subcategories.map((item => subcatsList[item.id] = catValue.title + ' > ' + item.title));
      }        
    }
    return subcatsList;
  }

  initEventListeners() {
    if (!this.evntSignal) {
      this.evntSignal = new AbortController();
    }

    const { signal } = this.evntSignal;

    if (this.toolbar.submit) {
      this.toolbar.submit.addEventListener('click', this.onProductSubmit, { signal });
    }

    if (this.toolbar.imageLoad) {
      this.toolbar.imageLoad.addEventListener('click', this.onImageLoad, { signal });      
    }
    this.subElements.imageListContainer.addEventListener("sortable-list-delete", this.onImageDelete, { signal });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    // NOTE: удаляем обработчики событий, если они есть
    if (this.evntSignal) {
      this.evntSignal.abort();
    }
    this.remove();
    this.element = null;   
    this.subElements = {}; 
  }    
}