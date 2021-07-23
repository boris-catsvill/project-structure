import SortableTable from '../../../components/sortable-table';
import { productsTableHeader } from '../../../constants';
import DoubleSlider from '../../../components/double-slider';

export default class Page {
  element;
  subElements = {};
  components = {};

  constructor() {
    this.initComponents();
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class='products-list'>
        <div class="content__top-panel">
          <h1 class="page-title">Products</h1>
          <a href="/products/add" class="button-primary">Add Product</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-elem="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="doubleSlider"></div>
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
        <div data-element='sortableTable'></div>
      </div>`;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');

    const sortableTable = new SortableTable(productsTableHeader, { url });
    const doubleSlider = new DoubleSlider({min: 0, max: 4000})

    this.components = { sortableTable, doubleSlider }
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
}
