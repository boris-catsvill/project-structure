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
    let ord = 1;
    const itemOrder = Array.from(event.target.querySelectorAll("[data-id]")).map(t=>({
        id: t.dataset.id,
        order: ord++
    }));
    this.element.dispatchEvent(new CustomEvent("subcategory-reorder", {
        bubbles: true,
        detail: itemOrder
    }));
    return false;
  }

  constructor(list = [{ id : 'Some_id', title : 'Some title', itemList: [] }]) {
    this.list = list;
    this.render();
    this.initEventListeners();
  }

  render() {
    this.element = document.createElement('div');
    const { signal } = this.evntSignal;

    const renderArray = this.list.map((catItem) => {
      let element = null;
      element = document.createElement('div');
      
      element.innerHTML = this.getTemplate(catItem.id, catItem.title);
      const header = element.querySelector(".category__header");
      const body = element.querySelector(".subcategory-list"); //category__body
      header.addEventListener("pointerdown", (event) =>this.onPointerDown(event), { signal });
        
      element.addEventListener('sortable-list-reorder',
        (event) =>this.onSubcatReorder(event), { signal });

      if (catItem.itemList){
        const catSection = catItem.itemList.map((item)=> {
          const wrapper = document.createElement('div');
          wrapper.innerHTML = this.getItemTemplate(
            item.id, item.title, `<b>${item.count}</b> products`);

          return wrapper.firstElementChild;
        });
        const sortableList = new SortableList({ items: catSection });
        body.append(sortableList.element);
      }
      this.element.append(element);
    });    
  }

  getSubelements() {
    return {};
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
      </li>`; //sortable-list__item
  }

  initEventListeners() {
    if (!this.evntSignal) {
      this.evntSignal = new AbortController();
    }
    /*
    this.components.categoriesContainer.element.addEventListener(
        'sortable-list-reorder',(event) =>this.onSubcatReorder(event), { signal });
    */
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