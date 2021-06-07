import fetchJson from '../../utils/fetch-json';
import SortableList from '../../components/sortable-list/index.js';
const urlParam = 'https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory'
export default class Page {
  element;

  getCategory = () => {
    return fetchJson(urlParam)
  }

  renderComponent = async () => {
    const category = await this.getCategory()
    const template = category.map(({id, title, subcategories})=> {

      const div = document.createElement('div');
      div.innerHTML = `
        <div class="category category_open" data-id="${id}">
          <header class="category__header">${title}</header>
          <div class="category__body">
            <div class="subcategory-list"></div>
          </div>
      </div>
      `;

      const elements = getSubCategory(subcategories);
      div.querySelector('.subcategory-list').append(elements);
      return div
    })

    function getSubCategory(subcategories) {
      const items = subcategories.map(({id, title, count}) => {
        const wrapper = document.createElement('div')
        wrapper.innerHTML =  `
          <li class="categories__sortable-list-item sortable-list__item" data-grab-handle data-id="${id}">
            <strong>${title}</strong>
            <span><b>${count}</b> products</span>
          </li>
        `
        return wrapper.firstElementChild;
      })

      const sortableList = new SortableList({ items });
      return sortableList.element
    }


    for (let item of template) {
      this.subElements.categoriesContainer.append(item)
    }
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h2 class="page-title">Категории товаров</h2>
      </div>
      <div data-element="categoriesContainer"></div>
    </div>
    ;`
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML =  this.template;

    this.element = element.firstElementChild
    this.subElements = this.getSubElements(this.element);

    this.renderComponent();

    return this.element;
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

}