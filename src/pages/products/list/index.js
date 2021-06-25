import SortableList from '../../../components/sortable-list/index.js';
import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import escapeHtml from '../../../utils/escape-html.js';
import fetchJson from '../../../utils/fetch-json.js';
import header from './products-header.js';


const IMGUR_CLIENT_ID = `${process.env.IMGUR_CLIENT_ID}`;  
const BACKEND_URL = `${process.env.BACKEND_URL}`; 

export default class Page {
  element;
  subElements = {};
  from = 0; 
  to = 4000;
  constructor() {
    this.render();
  }

  async onQuantity(from, to) {
        this.from = from;
        this.to = to;
        this.onProduct();
  }

  onProduct = async () => {
       const url = new URL(`api/rest/products`, BACKEND_URL);
       const data = await fetchJson(url);
       const arr = data.filter(item => 
           item.quantity > this.from && item.quantity < this.to 
       );
       const formDoc = document.forms[0];
       const input = formDoc[0].value; 
       const arrTitle = arr.filter(item => 
           item.title.toUpperCase().indexOf(escapeHtml(input).toUpperCase()) !== -1   
       );
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
            isSortlocally: true
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
      <div class="products-list"><div class="content__top-panel">
            <h1 class="page_title">Товары</h1>
                <a href="/products/add" class="button-primary">Добавить товар</a></div>
                <div class="content-box.content-box_small"><form class="form-inline">
                  <div class="form-group">
                    <label class="form-label">Сортировать по:</label>
                    <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара" ></input>
                  </div>
                  <div class="form-group" data-elem="sliderContainer">
                    <label class="form-label">Цена:</label>
                    <div data-element="doubleSlider"></div>
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
                <div data-element="sortableTable"></div>
            </div>`;
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


  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }


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
            item.title.toUpperCase().indexOf(escapeHtml(input).toUpperCase()) !== -1   
         );

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