import fetchJson from '../../components/product-form/utils/fetch-json';
import CategoriesContainer from '../../components/categories';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class Page {
  element;
  categoriesData;
  subElements;
  subElementsList;
  components = {};

  constructor() {

  }

  async initComponents() {
    const data = await this.loadCategories();
    this.categoriesData = data;
    const categoriesContainer = new CategoriesContainer(this.categoriesData);
    this.components.categoriesContainer = categoriesContainer;
    const list = this.components.categoriesContainer.render();
    this.subElementsList = list;
    // console.log(list);
  }

  initEventListeners() {
    const toggleSidebar = document.querySelector('.sidebar__toggler');
    this.toggleSidebar = toggleSidebar;
    this.toggleSidebar.addEventListener('click', this.togglerSidebar);
  }

  togglerSidebar() {
    document.body.classList.toggle("is-collapsed-sidebar")
  }

  loadCategories() {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async render() {
    await this.initComponents();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.subElements.categoriesContainer.append(this.subElementsList);
    this.initEventListeners();
    return this.element;
  }

  get template() {
    return `
    <div class='categories'>
        <div class='content__top-panel'>
          <h1 class='page-title'>Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-elem='categoriesContainer'>
       </div>
     </div>
    `;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-elem]');
    [...elements].map(element => {
      result[element.dataset.elem] = element;
    });
    return result;
  }


  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.toggleSidebar.removeEventListener('click', this.togglerSidebar);
    this.remove();
    this.element = null;
  }

}