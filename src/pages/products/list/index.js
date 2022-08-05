import SortableTable from "../../../components/sortable-table";
import header from "../../dashboard/bestsellers-header";
import DoubleSlider from "../../../components/double-slider";

export default class Page {
  element;
  subElements = {};
  components = {};
  filter = {
    price_gte: 0,
    price_lte: 4000,
    title_like: '',
    status: ''
  };

  constructor() {
    this.filterTable = this.filteringTable.bind(this);
    this.rangeSelect = this.rangeSelection.bind(this);
  }

  updateComponents(from = this.filter.price_gte, to = this.filter.price_lte) {
    this.filter.status = this.subElements.filterStatus.value;
    this.filter.title_like = this.subElements.filterName.value;

    this.filter.price_gte = from;
    this.filter.price_lte = to;

    this.components.sortableTable.filterTable(this.filter);
  }

  get template() {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h2 class="page-title">Товары</h2>
        <a href="../../products/add" class="button-primary">Добавить товар</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Сортировать по:</label>
            <input type="text" data-element="filterName" class="form-control" placeholder="Название товара">
          </div>
          <div class="form-group" data-element="doubleSlider">
            <label class="form-label">Цена:</label>
            <div class="range-slider"></div>
          </div>
          <div class="form-group">
            <label class="form-label">Статус:</label>
            <select class="form-control" data-element="filterStatus">
              <option value="" selected="">Любой</option>
              <option value="1">Активный</option>
              <option value="0">Неактивный</option>
            </select>
          </div>
        </form>
      </div>
      <div data-element="sortableTable" class="products-list__container">
        <div class="sortable-table"> </div>
      </div>
      `;
  }

  initComponents() {
    const min = 0;
    const max = 4000;
    const doubleSlider = new DoubleSlider({
      min,
      max,
      selected: {min, max},
      formatValue: value => '$' + value
    });

    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products',
    });

    this.components = {
      doubleSlider,
      sortableTable
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];
      root.append(element);
    });
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.addListeners();

    return this.element;
  }

  getSubElements(element) {
    let elements = element.querySelectorAll("[data-element]");
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});

  }

  rangeSelection(event,
    status = this.subElements.filterStatus.value,
    name = this.subElements.filterName.value) {
    const {from, to} = event.detail;
    this.updateComponents(from, to, status, name);
  }

  filteringTable() {
    this.updateComponents();
  }

  addListeners() {
    this.subElements.filterStatus.addEventListener('change', this.filterTable);
    this.subElements.filterName.addEventListener('input', this.filterTable);
    this.components.doubleSlider.element.addEventListener('range-select', this.rangeSelect);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements.filterStatus.removeEventListener('change', this.filterTable);
    this.subElements.filterName.removeEventListener('input', this.filterTable);
    this.components.doubleSlider.element.removeEventListener('range-select', this.rangeSelect);
    this.subElements = {};
    this.element = null;
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

}
