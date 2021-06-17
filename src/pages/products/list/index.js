import SortableList from '../../../components/sortable-list/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import escapeHtml from '../../../utils/escape-html.js';
import fetchJson from '../../../utils/fetch-json.js';
import header from './products-header.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
  element;
  subElements = {};
  from = 0; 
  to = 4000;
//  defaultFormData = {
//    title: '',
//    description: '',
//    quantity: 1,
//    subcategory: '',
//    status: 1,
//    images: [],
//    price: 100,
//    discount: 0
//  };



  constructor() {
    this.render();
  }

  async onQuantity(from, to) {
        this.from = from;
        this.to = to;
        this.onProduct();
  }

  onProduct = async () => {
       const data = await fetchJson(`${BACKEND_URL}/api/rest/products`)
       const arr = data.filter(item => 
           item.quantity > this.from && item.quantity < this.to 
       );
       const formDoc = document.forms[0];
       const input = formDoc[0].value; 
       const arrTitle = arr.filter(item => 
           item.title.toUpperCase().indexOf(escapeHtml(input).toUpperCase()) != -1   
       );
         //const select = formDoc[1].selectedIndex; 
       let arrSatus;
       switch(formDoc[1].selectedIndex) {
          case 0:
              arrSatus = arrTitle;
              break;
          case 1:
              arrSatus = arrTitle.filter(item => item.status === 1);  
              break;
          case 2:
              arrSatus = arrTitle.filter(item => item.status === 0);  
              break;
      }
      this.components.sortableTable.addRows(arrSatus);
  }

  initComponents() {
        let now = new Date(); 
        let from = new Date(); 
        const to = new Date( now.setMonth( now.getMonth() - 1 ) );
        
        const doubleSlider = new DoubleSlider( { 
            min: 0,
            max: 4000
        } );


        const sortableTable = new SortableTableProducts(header, {
            url: `api/rest/products`,   
            isSortlocaly: true
        });

        this.components = {
            doubleSlider,
            sortableTable,
        };

 
  }

  randerComponents() {
        Object.keys(this.components).forEach(component => {
            const root = this.subElements[component];
            const { element } = this.components[component];

            root.append(element);
        });
  }

  template() {
    return `
      <div class="products-list">
            <div class="content__top-panel">
                <h1 class="page_title">Товары</h1>
                <a href="/products/add" class="button-primary">Добавить товар</a>
             </div>
             <div class="content-box.content-box_small">
                <form class="form-inline">
                  <div class="form-group">
                    <label class="form-label">Сортировать по:</label>
                    <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара" >
                  </div>
                  <div class="form-group" data-elem="sliderContainer">
                    <label class="form-label">Цена:</label>
                    <div data-element="doubleSlider">
                     </div>
                   <!-- slider    -->
                  </div>
                  <div class="form-group">
                    <label class="form-label">Статус:</label>
                    <select class="form-control" data-elem="filterStatus">
                      <option value="" selected="">Любой</option>
                      <option value="1">Активный</option>
                      <option value="0">Неактивный</option>
                    </select>
                  </div>
                </form>
            </div>
            <div data-elem="productsContainer" class="products-list__container">
                <div data-element="sortableTable">
                </div>
                <!-- sortableTable    -->
            </div>
        </div>
            `;
  }

  

   initEventListener() {
        const elems = this.element.querySelectorAll(".form-control");   //"form-control"
        for(let elem of elems) {
             if (elem.dataset.elem === "filterName") {
                elem.addEventListener('input', this.onProduct);
             } else if (elem.dataset.elem === "filterStatus") {
                elem.addEventListener('change', this.onProduct);
             } 
        }
        this.components.doubleSlider.element.addEventListener('range-select', event => {  
            const {from, to } = event.detail;
            this.onQuantity(from, to);
        });
  }


  render() {

        this.element = document.createElement('div'); // (*)
        this.element.innerHTML = this.template;
        this.element = this.element.firstElementChild;
        this.subElements = this.getSubElements(this.element);

        this.initComponents();
        this.randerComponents();
        this.initEventListener();
        return this.element;

  }

  renderForm() {
    const element = document.createElement('div');

    element.innerHTML = this.formData
      ? this.template()
      : this.getEmptyTemplate();

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getEmptyTemplate() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
  }



//  getFormData() {
//    const { imageListContainer, productForm } = this.subElements;
//    const excludedFields = ['images'];
//    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
//    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
//    const getValue = field => productForm.querySelector(`[name=${field}]`);
//    const values = {};

//    for (const field of fields) {
//      const value = getValue(field);

//      values[field] = formatToNumber.includes(field)
//        ? parseInt(value)
//        : value;
//    }

//    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

//    values.images = [];
//    values.id = this.productId;

//    for (const image of imagesHTMLCollection) {
//      values.images.push({
//        url: image.src,
//        source: image.alt
//      });
//    }

//    return values;
//  }

//  dispatchEvent(id) {
//    const event = this.productId
//      ? new CustomEvent('product-updated', { detail: id })
//      : new CustomEvent('product-saved');

//    this.element.dispatchEvent(event);
//  }

//  setFormData() {
//    const { productForm } = this.subElements;
//    const excludedFields = ['images'];
//    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));

//    fields.forEach(item => {
//      const element = productForm.querySelector(`#${item}`);

//      element.value = this.formData[item] || this.defaultFormData[item];
//    });
//  }

//  loadProductData(productId) {
//    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
//  }

//  loadCategoriesList() {
//    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
//  }

//  createCategoriesSelect() {
//    const wrapper = document.createElement('div');

//    wrapper.innerHTML = '<select class="form-control" id="subcategory" name="subcategory"></select>';

//    const select = wrapper.firstElementChild;

//    for (const category of this.categories) {
//      for (const child of category.subcategories) {
//        select.append(new Option(`${category.title} > ${child.title}`, child.id));
//      }
//    }

//    return select.outerHTML;
//  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

//  createImagesList() {
//    const { imageListContainer } = this.subElements;
//    const { images } = this.formData;

//    const items = images.map(({ url, source }) => this.getImageItem(url, source));

//    const sortableList = new SortableList({
//      items
//    });

//    imageListContainer.append(sortableList.element);
//  }

//  getImageItem(url, name) {
//    const wrapper = document.createElement('div');

//    wrapper.innerHTML = `
//      <li class="products-edit__imagelist-item sortable-list__item">
//        <span>
//          <img src="icon-grab.svg" data-grab-handle alt="grab">
//          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
//          <span>${escapeHtml(name)}</span>
//        </span>
//        <button type="button">
//          <img src="icon-trash.svg" alt="delete" data-delete-handle>
//        </button>
//      </li>`;

//    return wrapper.firstElementChild;
//  }

 

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    if(this.element) {
        this.element.remove();
    }
  }
}

export class SortableTableProducts extends SortableTable {
      
     getTableRows(data=[]) {
         if(!data.length) {
            return;
         }
         return data.map(item => `
           <a href=/products/${item.id} class="sortable-table__row">
             ${this.getTableRow(item, data)}
           </a>`
        ).join('');
    }

    addRows(data=[]) {
         const formDoc = document.forms[0];
         const input = formDoc[0].value; //const elem = document.querySelector("form-control");   ///document.forms[0];
         let arr = data.filter(item => 
            item.title.toUpperCase().indexOf(escapeHtml(input).toUpperCase()) != -1   
         );
         //const select = formDoc[1].selectedIndex; 
         let arrSel;
         switch(formDoc[1].selectedIndex) {
            case 0:
                arrSel = arr;
                break;
            case 1:
                arrSel = arr.filter(item => item.status === 1);  
                break;
            case 2:
                arrSel = arr.filter(item => item.status === 0);  
                break;
         }

//         this.subElements.body.innerHTML = this.getTableRows(arrSel);
         let from; let to;
         const elem = document.querySelector(".range-slider");
         for(let element of elem.children) {
            if (element.dataset.element==="from") {
                from = escapeHtml(element.innerText).match(/\d/g).join('');   
            } else if (element.dataset.element==="to") {
                to = escapeHtml(element.innerText).match(/\d/g).join('');  
            }
         }

        let arrSlider = arrSel.filter(item => 
        item.quantity > from && item.quantity < to 
        );
        this.subElements.body.innerHTML = this.getTableRows(arrSlider);
        
   }
  




}