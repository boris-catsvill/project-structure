import SortableList from '../../components/sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';


export default class Categories {
  element;
  subElements = {};
  categoriesData;

  constructor(){
    
    this.url = new URL('/api/rest/categories?_sort=weight&_refs=subcategory',BACKEND_URL);
    this.render();
  }

    
  async render() {

    const element = document.createElement('div');
    
    element.innerHTML = `<div data-element="categoriesContainer"> </div>`;
    this.element = element.firstElementChild;

    this.categoriesData = await this.loadCategories();

    this.getCategories();
  
    this.addEventListeners();

    return this.element;
  }

  addEventListeners(){
    
    this.element.addEventListener('pointerdown', this.onPointerDown);
  }

  onPointerDown = (event) =>{
    const targetElem = event.target.closest('.category__header');
    if (targetElem)
      targetElem.parentNode.classList.toggle('category_open');

  }

  async loadCategories(){
    
    try {
      return await fetchJson(this.url);
    } catch (error) {
      console.error('Can not load product categories');
    }    
    }

  getCategories(){
       
    const categoryElements = [...this.categoriesData];
     
    categoryElements.map(category =>{

        const categoryElem =  document.createElement('div');
        categoryElem.innerHTML = `
                            <div class="category category_open" data-id="${category.id}">
                                <header class="category__header"> ${category.title} </header>
                            </div>`;                                          
           
        const categoryBody = this.getSubcategories(category.subcategories);
        categoryElem.firstElementChild.append(categoryBody);
        
        this.element.append(categoryElem.firstElementChild);
      })
  }

  getSubcategories(arr){

    const categoryBody = document.createElement('div');
    categoryBody.classList.add("category__body");
    const categoryList = document.createElement('div');
    categoryList.classList.add("subcategory-list");

    const items = arr.map(({id,title,count}) => {

        const elem = document.createElement('div');
        elem.innerHTML =  `
                    <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${id}">
                      <strong>${title}</strong>
                      <span><b>${count}</b> products</span>                            
                    </li>`;
         return elem.firstElementChild;            
        }
      )
             
    const sortableList = new SortableList({items});
    categoryList.append(sortableList.element);
    categoryBody.append(categoryList);
        
    return  categoryBody;

  }

  destroy() {
      this.remove;
      this.subElements = {};
  }

}