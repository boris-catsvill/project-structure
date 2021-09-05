
import SortableList from "./../sortable-list/index.js";
import fetchJson from "./../../utils/fetch-json.js";  //"./fetch-json.js";   ///
const BACKEND_URL = `${process.env.BACKEND_URL}`; 

export default class Categories {
  element;
  sortedlists;
  subElements = {};
  data = [];
  
  handler = async (event) => {
        const elem = event.target.closest('[data-id]');
        if (elem)  {
           elem.classList.toggle("category_open")
        }

        const dragging = event.target.closest('[data-grab-handle]');
        if(dragging) {
            let event = new Event('pointerdown'); 
            dragging.dispatchEvent(event);
        }
  };
  
  constructor( {
        url = '',  //api/rest/categories?_sort=weight&_refs=subcategory
        refs = '',
        sort = '',
        isSortLocally = false
          } = {}) {

        this.url = new URL(url, BACKEND_URL);
        this.isSortLocally = isSortLocally;
        this.sort = 'weight';
        this.refs = 'subcategory';

        this.render();
        this.loadData(this.sort, this.refs);
    
  }

  addEventListeners() {
        this.element.addEventListener('pointerdown', this.handler);//'click'
       // this.subElements.header.removeEventListener('pointerdown', this.handler);
  }

  async render() {

        const wrapper = document.createElement('div');

        wrapper.innerHTML = this.getTemplate();

        const element = wrapper.firstElementChild;

        this.element = element;

       //this.subElements = this.getSubElements(element);

  }

  getTemplate() {
     return ` <div class="content" id="content">
                <div class="categories">
                   <div class="content__top-panel">
                     <h1 class="page_title">Категории товаров</h1>
                   </div>
                   <div data-element="categoriesConteiner" >
                    </div>
                </div>
             </div>`;
  }


  async loadData(sort, refs) {
        this.url.searchParams.set('_sort', sort);
        this.url.searchParams.set('_refs', refs);

        const data = await fetchJson(this.url); // n кол-во времени
        this.renderRows(data);
  }

   getTables(data=[]) {
        if (!data.length) {
            return [];
        }
        const arr=[];
        for(let item of data) {
            const elem = this.getTable(item);
            arr.push(elem);
        }
         return arr;
   }

   getTable(item) {
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="category_open" data-id="${item.id}">
               <header class="category__header">${item.title}</header>
            </div>`;
         const elem = wrapper.firstElementChild;
         elem.dataset.id = `${item.id}`;
         elem.classList.add("category");
         elem.classList.add("category_open");
         
         const subcategory = this.getSubcategories(item.subcategories)
         const elemement = elem.querySelector(".category__header");
         elemement.after(subcategory);
         return elem;
   }

   getSubcategories(data=[]) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
            <div class="category__body">
                <div class="subcategory-list" ></div>
           </div> 
           `;
         const elem = wrapper.firstElementChild;
         const subcategory = this.initSortableList(data);
         const elemement = elem.querySelector(".subcategory-list");
         elemement.append(subcategory);
         return elem;

   }


   initSortableList(data) {
        //const { categoriesConteiner } = this.subElements;
        const items = data.map( item => this.getListItem(item.id, item.title, item.count));
        const sortableList = new SortableList({
            items
        });
        return sortableList.element;

   }

   getListItem(id, title, count) {
       
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <li class="categories__sortable-list-item sortable-list__item" data-grab-handle>
        <strong >${title} </strong>
        <span> <b>${count}</b> products</span>
        </li>`;
        wrapper.firstElementChild.dataset.id = `${id}`;
        return wrapper.firstElementChild;
   }

  renderRows(data) {
     if (data.length) {
        this.addRows(data);
     }
  }

  addRows(data=[]) {
      this.data = data;

      const arrCategory = this.getTables(this.data);
      const elem = this.element.querySelector('[data-element]');

      for (let element of arrCategory) {
         elem.insertAdjacentElement('beforeend', element);   
      }
     
      this.addEventListeners();
  }

  getSubElements(element) {
        const subElements = {};
        const elements = element.querySelectorAll('[data-element]');

        for (const item of elements) {
          subElements[item.dataset.element] = item;
        }

        return subElements;
  }

  remove() {
        this.element.remove();
  }

  destroy() {
        this.remove();
        this.subElements = {};
  }
}