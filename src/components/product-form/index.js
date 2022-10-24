import SortableList from '../sortable-list/index.js'
import escapeHtml from '/src/utils/escape-html.js';
import fetchJson from '/src/utils/fetch-json.js';

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {

  element;
  subElements = {}; 
  defaultFormData = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  }

  loadImage = ()=> {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*"

    fileInput.click();

    fileInput.addEventListener("change", async () => {
      try {
        const [file] = fileInput.files;

        if(file){
          const formData = new FormData();

          formData.append("image", file);
      
          const response = await fetch("https://api.imgur.com/3/image",{
            method: "POST",
            headers: {
              Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body: formData,
            referrer: ""
          });

          const result = await response.json();

          const {imageListContainer} = this.subElements;

          imageListContainer.append(this.getImageItem(result.data.link, file.name));
        }
        
        fileInput.remove();
      } catch (error) {
        throw new Error(error);
      }
    })
  }

  constructor (productId = "") {
    this.productId = productId;
    this.prodctsAPI = "api/rest/products"
    this.categories = [];
    this.data = this.defaultFormData;
  }

  get template(){
    return `
      <div class = "products-edit">

        <div class = "content__top-panel">
          <h1 class = "page-title">
            <a href = "/products" class = "link"> Товары </a>
            ${this.productTitile}
          </h1>
        </div>

        <div class = "content-box">
          <div class = "product-form">
            <form data-element = "productForm" class = "form-grid">
              <div class = "form-group form-group__half_left">
                ${this.createFieldset({
                  lable: "Название товара",
                  inputName: "title",
                  inputType: "text",
                  inputPlaceholder: "Название товара",
                  value: this.productName
                })}
              </div>

              <div class = "form-group form-group__wide">
                <label class = "form-label">Описание</label>
                <textarea required class = "form-control" name = "description" placeholder = "Описание товара">${this.productDescription}</textarea>
              </div>

              <div class = "form-group form-group__wide" data-element = "sortable-list-container">
                <label class = "form-label">Фото</lable>
                <div data-element = "imageListContainer"></div>
                <button type="button" name="uploadImage" data-element = "uploadImage" class="button-primary-outline fit-content">
                  <span>Загрузить</span>
                </button>
              </div>

              <div class = "form-group form-group__half_left">
                <label class = "form-label">Категория</label>
                ${this.getProductCategory()}
              </div>

              <div class = "form-group form-group__half_left form-group__two-col">
              ${this.createFieldset({
                  lable: "Цена ($)",
                  inputName: "price",
                  inputType: "number",
                  inputPlaceholder: "100"
                })}
              ${this.createFieldset({
                  lable: "Скидка ($)",
                  inputName: "discount",
                  inputType: "number",
                  inputPlaceholder: "0"
                })}
              </div>

              <div class = "form-group form-group__part-half">
              ${this.createFieldset({
                  lable: "Колличество",
                  inputName: "quantity",
                  inputType: "number",
                  inputPlaceholder: "1"
                })}
              </div>

              <div class = "form-group form-group__part-half">
                <label class = "form-label">Статус</label>
                ${this.getStatusSelection()}
              </div>

              <div class = "form-buttons">
                <button type = "submit" name = "save" class = "button-primary-outline">${this.buttonText} товар</button>
              </div>

            </form>
          </div>
        </div>
      </div>
    `
  }

  getStatusSelection(){
    const div = document.createElement("div");

    div.innerHTML = `<select class = "form-control" name = "status"></select>`;

    const select = div.firstElementChild;

    select.append(new Option("Активен", 1));
    select.append(new Option("Неактивен", 0));

    return select.outerHTML;
  }

  getProductCategory(){
    const div = document.createElement("div");

    div.innerHTML = `<select class = "form-control" name = "subcategory" id = "subcategory"></select>`

    const select = div.firstElementChild;

    for (const category of this.categories) {
      for(const subcategory of category.subcategories){
        select.append(new Option(`${category.title} > ${subcategory.title}`, subcategory.id));
      }
    }

    return select.outerHTML;
  }

  createFieldset({lable, inputType, inputName, inputPlaceholder, value = this.data[inputName]}){
    return `
      <fieldset>
        <label class = "form-label">${lable}</label>
        <input required 
          type = "${inputType}"
          name = "${inputName}" 
          class = "form-control" 
          placeholder = "${inputPlaceholder}" 
          value = '${value}'>
      </fieldset>
    `
  }

  get productName(){
    return this.productId ? this.data.title : "";
  }

  get productTitile(){
    return this.productId ? "/ Редактировать" : "/ Добавить"
  }

  get productDescription(){
    return this.productId ? this.data.description : '';
  }

  get buttonText(){
    return this.productId ? "Сохранить" : "Добавить"
  }

  createImageList() {
    const {imageListContainer} = this.subElements;
    const {images} = this.data;

    const items = images.map(item => {
        return this.getImageItem(item.url, item.source);
      });
    
    const sortableList = new SortableList({items});

    imageListContainer.append(sortableList.element);
  }

  getImageItem(url, source){
    const div = document.createElement("div");

    div.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item">
                      <span>
                        <img src="./icon-grab.svg" data-grab-handle alt="grab">
                        <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
                        <span>${escapeHtml(source)}</span>
                      </span>

                      <button type="button">
                        <img src="./icon-trash.svg" alt="delete" data-delete-handle>
                      </button>
                    </li>`

    return div.firstElementChild;
  }

  async render () {
    const div = document.createElement("div");

    const categoriesPromise = this.categoriesReq();

    const productPromise = this.productId 
      ? this.productReq() 
      : Promise.resolve([this.defaultFormData]);
       
    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise])

    const productData = productResponse.reduce(item => item);
    this.data = productData;
    this.categories = categoriesData;

    div.innerHTML = this.template;

    this.element = div.firstElementChild;
    this.subElements = this.getSubElements();

    this.createImageList();

    this.addEventListeners();

    return this.element
  }

  addEventListeners(){
    const {productForm, uploadImage, imageListContainer} = this.subElements;

    productForm.addEventListener("submit", this.onSubmit);
    uploadImage.addEventListener("click", this.loadImage);

    imageListContainer.addEventListener('click', event => {
      const {deleteHandle} = event.target.dataset;
      if (deleteHandle !== undefined) {
        event.target.closest('li').remove();
      }
    });
  }

  getSubElements(element = this.element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  async save(){
    const product = this.getFormData();

    try {
      const url = new URL(this.prodctsAPI, BACKEND_URL);

      const response = await fetchJson(url, {
        method: this.productId ? "PATCH" : "PUT" ,
        headers: {
          "Content-type" : "application/json"
        },
        body: JSON.stringify(product)
      });
      this.dispatchEvent(response.id);
    } catch (error) {
      throw new Error(error);
    }
  }

  getFormData(){
    const {productForm, imageListContainer} = this.subElements;
    const imField = ["images"];
    const formatToNumber = ["price", "quantity", "discount", "status"];
    const fields = Object.keys(this.defaultFormData).filter(item => !imField.includes(item));
    const getValue = field => productForm.querySelector(`[name = ${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
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

  dispatchEvent(id){
    const event = this.productId
      ? new CustomEvent("product-updated", {detail: id})
      : new CustomEvent("product-save");

      this.element.dispatchEvent(event)
  }

  async productReq(){
    const url = new URL(this.prodctsAPI, BACKEND_URL);
    url.searchParams.set("id", this.productId)
    
    const data = await fetchJson(url);

    return data;
  }

  async categoriesReq(){
    const url = new URL("api/rest/categories", BACKEND_URL)
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");
    
    const categoriesData =  await fetchJson(url);

    return categoriesData;
  }

  destroy(){
    this.remove();
    this.element = null;
    this.subElements = {};
  }
  
  remove () {
    if (this.element) {
      this.element.remove();
    }
  }
}
