import SortableTable from '../../../components/sortable-table';
import ProductHeader from '../../../components/product-header';
import header from '../list/header-products';

export default class Page {
  element;
  subElements = {};
  components = {};
  MIN_PRICE = 0;
  MAX_PRICE = 4000;

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    await this.renderComponents();
    this.initEventListener();

    return this.element;
  }

  get template () {
    return `
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
      <div class="content-box content-box_small" data-element = "productHeader">

      <!-- product-header -->

      </div>
      <div data-element="productsContainer" class="products-list__container">

      <!-- productsContainer -->

      </div>
    </div>
		`;
  }

  initComponents() {

    const productHeader = new ProductHeader({
      min: this.MIN_PRICE,
      max: this.MAX_PRICE
    });

    const productsContainer = new SortableTable(header, {
      url: `api/rest/products?_start=1&_end=20`,
      isSortLocally: false
    });

    this.components = {
      productsContainer,
      productHeader
    };
  }

  async renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const {element} = this.components[component];

      root.append(element);
    });
  }

  updateHeader = () => {
    const sliderContainer = this.components.productHeader.components.sliderContainer

    sliderContainer.subElements.from.innerHTML = sliderContainer.formatValue(0)
    sliderContainer.subElements.to.innerHTML = sliderContainer.formatValue(4000)

    sliderContainer.update()

    this.components.productHeader.element.reset()
  }

  updateTable = async (event) => {
    const { productsContainer } = this.components;

    productsContainer.destroy();

    switch (event.type) {
      case "input":
        productsContainer.title_like = event.target.value;
        break;
      case "range-select":
        productsContainer.price_gte = event.detail.from;
        productsContainer.price_lte = event.detail.to;
        break;
      case "change":
        productsContainer.status = event.target.value
        break;
      case "reset-filters":
        productsContainer.title_like = '';
        productsContainer.price_gte = this.MIN_PRICE;
        productsContainer.price_lte = this.MAX_PRICE;
        productsContainer.status = '';
        this.updateHeader();
    }
    productsContainer.start = 1;
    productsContainer.end = 21;
    productsContainer.dataHave = true;

    await productsContainer.render()

    const root = this.subElements["productsContainer"];
    const {element} = this.components["productsContainer"];

    root.append(element)
  }

  initEventListener () {
    const {filterName, sliderContainer, filterStatus} = this.components.productHeader.subElements;

    filterName.addEventListener("input", this.updateTable)
    sliderContainer.addEventListener("range-select", this.updateTable)
    filterStatus.addEventListener("change", this.updateTable)
    this.subElements.productsContainer.addEventListener("reset-filters", this.updateTable)
  }

  getSubElements ($element) {
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
