import Categories from '../../components/categories/index';
import fetchJson from '../../utils/fetch-json';

export default class Page {

  element;
  subElements = {};
  components = {};

  get template() {
    return `
        <div class="categories">
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>
            <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
            <div data-element="categories"></div>
        </div>
    `;
  }

  async initComponents () {
    const data = await fetchJson(`${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`)
    const categories = new Categories(data)
    this.components.categories = categories
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();

    return this.element;
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
