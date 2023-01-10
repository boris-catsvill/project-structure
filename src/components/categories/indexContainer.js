//import Category from './index.js';
import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';

export default class CategoriesContainer { 
  // events
  evntSignal = new AbortController();

  //rendering    
  element;
  subElements = {};
  components = {};
  
  onPointerDown = (event) => {
    if (event.which !== 1) {return false;}
    event.preventDefault();
    const categBlock = event.target.closest("[data-id]");
    if (categBlock) {
        categBlock.classList.toggle("category_open");
    }
    return false; 
  }

  onSubcatReorder = (event) => {
    const elements = event.target.querySelectorAll("[data-id]");    
    const itemOrder = [...elements].map((elem, ord) =>({
        id: elem.dataset.id,
        order: ord
    }));
    this.element.dispatchEvent(new CustomEvent("subcategory-reorder", {
        bubbles: true,
        detail: itemOrder
    }));
    return false;
  }

  constructor(list = [{ id : 'containerId', title : 'Container title', itemList: [] }]) {
    this.list = list;
    this.render();
    this.initEventListeners();
  }

  render() {
    this.element = document.createElement('div');
    const { signal } = this.evntSignal;

    const renderArray = this.list.map((catItem) => {
      const element = document.createElement('div');
      
      element.innerHTML = this.getTemplate(catItem.id, catItem.title);
      const header = element.querySelector(".category__header");
      const body = element.querySelector(".subcategory-list");
      header.addEventListener("pointerdown", (event) =>this.onPointerDown(event), { signal });
        
      element.addEventListener('sortable-list-reorder',
        (event) =>this.onSubcatReorder(event), { signal });

      if (catItem.itemList){
        this.addListElements(catItem.itemList, body)    
        this.element.append(element);
      }
    });    

    this.subElements = this.getSubelements()
  }

  addListElements(itemList, parent) {
    const catSection = itemList.map((item)=> {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getItemTemplate(
        item.id, item.title, `<b>${item.count}</b> products`);

      return wrapper.firstElementChild;
    });
    const sortableList = new SortableList({ items: catSection });
    parent.append(sortableList.element);
  }
  
  getSubelements() {
    const headers = this.element.querySelectorAll(".category__header");   

    return [...headers].reduce((accum, subElement) => {
      accum["category_"+subElement.dataset.id] = subElement;

      return accum;
    }, {});
  }

  getTemplate(id, title) {
    return `
      <div class="category category_open" data-id="${id}">
      <header class="category__header"> ${title} </header>
        <div class="category__body">
            <div class="subcategory-list"></div>
        </div>
      </div>`
  }

  getItemTemplate(id, name, number_str) {
    return`
      <li class="categories__sortable-list-item " data-grab-handle=""
         data-id="${id}">
        <strong>${escapeHtml(name)}</strong>
        <span>${number_str}</span>
      </li>`;
  }

  initEventListeners() {
    if (!this.evntSignal) {
      this.evntSignal = new AbortController();
    }
  }

  remove() {
    if (this.element){
      this.element.remove();
    }
  }

  destroy() {
    if (this.evntSignal) {
      this.evntSignal.abort();
    }
    this.remove();
    this.element = null;   
    for (const component of Object.values(this.components)) {
        component.destroy();
    }
  }  
}