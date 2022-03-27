import Categories from "../../components/categories";
import fetchJson from '../../utils/fetch-json';

export default class Page {
  element = {};
  subElements = {};
  components = {};
  categories = [];
  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Категории товаров</h1>
        </div>
        <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
        <div data-element="categoriesContainer"></div>
      </div>
    `;
  }

  loadData = async () => {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  };

  render = async () => {
    const wrapper = document.createElement('div');
    wrapper.insertAdjacentHTML('beforeend', this.template);

    this.element = wrapper.firstElementChild;
    this.getSubElements();
    this.categories = await this.loadData();
    this.getComponents();
    this.renderComponents();

    return this.element;
  };

  getSubElements = () => {
    this.subElements = [...this.element.querySelectorAll('[data-element]')].reduce((acc, item) => {
      acc[item.dataset.element] = item;
      return acc;
    }, {});
  };

  getComponents = () => {
    this.components = this.categories.reduce((acc, item) => {
      acc[item.id] = new Categories(item.title, item.subcategories, item.id);
      return acc;
    }, {});
  };

  renderComponents = () => {
    Object.values(this.components).forEach(item => {
      this.subElements.categoriesContainer.append(item.element);
    });
  };

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    Object.values(this.components).forEach(item => item.destroy);
    this.components = null;
    this.subElements = null;
    this.element = null;
    this.categories = null;
  };
}