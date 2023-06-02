//import ProductForm from '../../../components/product-form';
import menu from '../../../components/sidebar/menu';
import { IComponent, INodeListOfSubElements, IPage, SubElementsType } from '../../../types';
import DoubleSlider from '../../../components/double-slider';
import header from './header';
import fetchJson from '../../../utils/fetch-json';
import { ProductSortableTable } from '../../../components/product-sortable-table';

enum Components {
  Products = 'products',
  Slider = 'slider',
  FilterName = 'filterName',
  FilterStatus = 'filterStatus'
}

type PriceRangeType = {
  from: number;
  to: number;
};

interface PriceRangeEvent extends CustomEvent<PriceRangeType> {}

const PRODUCTS_URL = `${process.env['PRODUCT_API_PATH']}?_embed=subcategory.category&_start=0&_end=30&_sort=title&_order=asc`;

class ProductsPage implements IPage {
  element: Element;
  subElements: object;
  components = {};
  activeFilters = this.defaultFilter;

  get type() {
    return menu.products.page;
  }

  get defaultFilter() {
    return {
      title_like: '',
      status: ''
    };
  }

  get template() {
    return `<div class='products-list'>
              <div class='content__top-panel'>
                <h1 class='page-title'>Products</h1>
                <a href='/products/add' class='button-primary'>Add product</a>
              </div>
              <div class='content-box content-box_small'>
              <form class='form-inline'>
          <div class='form-group'>
            <label class='form-label'>Sort by:</label>
            <input type='text' data-element='${Components.FilterName}' class='form-control' placeholder='Название товара'>
          </div>
          <div class='form-group' data-element='${Components.Slider}'>
            <label class='form-label'>Price:</label>
          </div>
          <div class='form-group'>
            <label class='form-label'>Status:</label>
            <select class='form-control' data-element='${Components.FilterStatus}'>
              <option value='' selected=''>Any</option>
              <option value='1'>Active</option>
              <option value='0'>Inactive</option>
            </select>
          </div>
        </form>
                
              </div>
              <div class='products-list__container' data-element='${Components.Products}'>
                  
              </div>
            </div>`;
  }

  get emptyPlaceholder() {
    return `<p>No products found matching the selected criteria</p>
            <button type='button' class='button-primary-outline'>Clear filter</button>`;
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild!;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
    this.initListeners();
    return this.element;
  }

  getSubElements(element: Element) {
    const elements: INodeListOfSubElements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      const elementName = el.dataset.element;
      acc[elementName] = el;
      return acc;
    }, {} as SubElementsType);
  }

  initComponents() {
    const slider = new DoubleSlider({ min: 0, max: 4000, formatValue: data => `$${data}` });
    const products = new ProductSortableTable(header, { url: PRODUCTS_URL });
    this.components = { slider, products };
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      // @ts-ignore
      const root = this.subElements[component];
      // @ts-ignore
      const { element } = this.components[component];

      root.append(element);
    });
  }

  onSelectPrice = ({ detail: { from = 0, to = 0 } }: PriceRangeEvent) => {
    const filter = { price_gte: from, price_lte: to };
    this.activeFilters = { ...this.activeFilters, ...filter };
    this.filterProducts(this.activeFilters);
  };

  async filterProducts(filter: object) {
    // @ts-ignore
    const { products } = this.components;

    products.clearTable();
    products.isLoading = true;
    products.isEmpty = false;
    const loadedData = await this.loadedProducts(filter);
    products.isLoading = false;

    if (loadedData.length) {
      products.setEmptyPlaceholder();
      products.isSortLocally = true;
      products.isEmpty = false;
      products.addRows(loadedData);
    } else {
      products.isEmpty = true;
      this.setEmptyProductsPlaceholder(products);
    }
  }

  setEmptyProductsPlaceholder(component: IComponent) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.emptyPlaceholder;
    // @ts-ignore
    wrapper.querySelector('button').addEventListener('pointerdown', e => {
      this.clearFilter(e);
    });
    // @ts-ignore
    component.setEmptyPlaceholder(wrapper);
  }

  clearFilter(e: Event) {
    e.preventDefault();
    //@ts-ignore
    const { slider, products } = this.components;
    //@ts-ignore
    const { filterName, filterStatus } = this.subElements;
    filterName.value = '';
    filterStatus.value = '';
    slider.reset();
    this.activeFilters = this.defaultFilter;
    this.setProducts(products);
  }

  async setProducts(sortableTable: ProductSortableTable) {
    sortableTable.isLoading = true;
    sortableTable.isEmpty = false;
    sortableTable.setEmptyPlaceholder();
    const loadedData = await this.loadedProducts();
    sortableTable.isLoading = false;
    sortableTable.addRows(loadedData);
    sortableTable.isSortLocally = false;
  }

  loadedProducts(filter = {}) {
    const filterProductsUrl = new URL(PRODUCTS_URL, process.env.BACKEND_URL);
    for (const [field, value] of Object.entries(filter)) {
      if (value !== '') {
        filterProductsUrl.searchParams.set(field, String(value));
      }
    }
    return fetchJson(filterProductsUrl);
  }

  onSortTitle(e: PointerEvent) {
    e.preventDefault();

    // @ts-ignore
    const { value } = e.target;
    const { title_like } = this.activeFilters;
    if (title_like !== value) {
      const filter = { title_like: value };
      this.activeFilters = { ...this.activeFilters, ...filter };
      this.filterProducts(this.activeFilters);
    }
  }

  onSortStatus(e: PointerEvent) {
    e.preventDefault();
    // @ts-ignore
    const { value } = e.target;
    const { status } = this.activeFilters;
    if (status !== value) {
      const filter = { status: value };
      this.activeFilters = { ...this.activeFilters, ...filter };
      this.filterProducts(this.activeFilters);
    }
  }

  initListeners() {
    // @ts-ignore
    const { element: sliderElement } = this.components[Components.Slider];
    //@ts-ignore
    const { filterName, filterStatus } = this.subElements;
    sliderElement.addEventListener(DoubleSlider.SELECT_RANGE_EVENT, this.onSelectPrice);
    // @ts-ignore
    filterName.addEventListener('keyup', e => {
      this.onSortTitle(e);
    });
    // @ts-ignore
    filterStatus.addEventListener('change', e => {
      this.onSortStatus(e);
    });
  }

  removeListeners() {
    // @ts-ignore
    const { element: sliderElement } = this.components[Components.Slider];
    sliderElement.removeEventListener(DoubleSlider.SELECT_RANGE_EVENT, this.onSelectPrice);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      // @ts-ignore
      component.destroy();
    }
    this.removeListeners();
  }
}

export default ProductsPage;
