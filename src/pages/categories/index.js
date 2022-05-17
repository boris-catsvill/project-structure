import SortableList from "../../components/sortable-list";
import fetchJson from "../../utils/fetch-json";

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  subElements = {};
  components = {};
  urlCategory = new URL('api/rest/categories', BACKEND_URL);


  toggleOpen = (event)  => {
    if (event.target.classList.contains('category__header')) {
      event.target.parentNode.classList.toggle('category_open');
    }
  }



  async render() {
    const element = document.createElement('div');
    const data = await this.loadData();

    this.data = data;

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }


   initComponents() {


    for (const category of this.data) {
      this.components[category['id']] = new SortableList({
        items: category.subcategories.map(item => {
          const element = document.createElement('li');
          element.classList.add('categories__sortable-list-item');
          element.dataset.grabHandle = '';
          element.dataset.id = item.id;
          element.innerHTML = `
          <strong>${item.title}</strong>
          <span><b>${item.count}</b> products</span>
        `;

        return element;
        })
      })
    }
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
      root.append(element);
    })

    this.toggleProgressBar();
  }

  toggleProgressBar() {
    const element = document.querySelector('.progress-bar');
    return element.style.display === '' ? element.style.display = 'none' : element.style.display = 'none';
  }


  initEventListeners() {
    const { categoriesContainer } = this.subElements;

    document.addEventListener('sortable-list-reorder', async event => {
      console.log(event);
      // const { from, to } = event.details;
      await this.save(event.detail);
    }, true )

    categoriesContainer.addEventListener('click', this.toggleOpen);
  }

  dispatchEvent(detail) {
    this.element.dispatchEvent(new CustomEvent('notification-message', {
      bubbles: true,
      detail,
    }))
  }


  async save (data) {
    try {
      const responce = await fetch(`${BACKEND_URL}api/rest/subcategories`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify(data)
      });

      this.dispatchEvent({
        message: responce.text,
        status: 'success'
      });
    } catch (e) {
      this.dispatchEvent({
        message: e.message,
        status: 'error'
      });
    }


  }
  


  async loadData() {

    this.urlCategory.searchParams.set('_sort', 'weight');
    this.urlCategory.searchParams.set('_refs', 'subcategory');
    const data = await fetchJson(this.urlCategory);
    return data;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const item of elements) {
      this.subElements[item.dataset.element] = item;
    }
    // console.log(this.subElements);
    return this.subElements;
  }

  removeEventListener() {
    this.removeEventListeners('click', this.toggleOpen);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;

    for (const component of Object.value(this.component)) {
      component.destroy();
    }
  }

  getCategoriesContainer() {
    return this.data.map(category => {
      return `<div class="category category_open">
        <header class="category__header">
          ${category.title}
        </header>
        <div class="category__body">
        <div class="subcategory-list" data-element="${category.id}"></div> 
        </div>
        </div>`
    }).join('');
  }



  getTemplate() {
    return `<div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Categories of products</h1>
      </div>
      <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
      <div data-element="categoriesContainer">
        ${this.getCategoriesContainer()}
      </div>
    </div>`
  }
}