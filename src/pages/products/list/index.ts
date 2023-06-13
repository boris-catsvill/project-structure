import { getPageLink, Menu } from '../../../components/sidebar/menu';
import DoubleSlider from '../../../components/double-slider';
import header from './header';
import { ProductSortableTable } from '../../../components/product-sortable-table';
import { ROUTER_LINK } from '../../../router/router-link';
import { BasePage } from '../../../base-page';
import { IPage, TypeComponents } from '../../../types/base';
import { ComponentsEnum, PriceRangeEvent, ProductsComponents, ProductsSubElements } from './types';
import { API_ROUTES, CUSTOM_EVENTS } from '../../../constants';

const PRODUCTS_URL = `${API_ROUTES.PRODUCT}?_embed=subcategory.category`;

class ProductsPage extends BasePage implements IPage {
  element: Element;
  components: TypeComponents<ProductsComponents>;
  subElements: ProductsSubElements;
  filter = this.defaultFilter;

  get type() {
    return Menu.products.page;
  }

  get defaultFilter() {
    return {
      title_like: '',
      status: '',
      price_gte: NaN,
      price_lte: NaN
    };
  }

  get template() {
    return `<div class='products-list flex-column full-height'>
              <div class='content__top-panel'>
                <h1 class='page-title'>Products</h1>
                <a is='${ROUTER_LINK}' 
                   href='${getPageLink('products')}/add' 
                   class='button-primary'>
                   Add product
                </a>
              </div>
              <div class='content-box content-box_small'>${this.filterForm}</div>
              <div class='products-list__container full-height' 
                   data-element='${ComponentsEnum.Products}'>
              </div>
            </div>`;
  }

  get filterForm() {
    return `<form class='form-inline'>
                <div class='form-group'>
                  <label class='form-label'>Sort by:</label>
                  <input type='text' name='title_like' data-element='${ComponentsEnum.FilterName}' class='form-control' placeholder='Product Title'>
                </div>
                <div class='form-group' data-element='${ComponentsEnum.Slider}'>
                  <label class='form-label'>Price:</label>
                </div>
                <div class='form-group'>
                  <label class='form-label'>Status:</label>
                    <select name='status' class='form-control' data-element='${ComponentsEnum.FilterStatus}'>
                      <option value='' selected=''>Any</option>
                      <option value='1'>Active</option>
                      <option value='0'>Inactive</option>
                    </select>
                    
                </div>
                
           </form>`;
  }

  async render() {
    super.render();
    this.initComponents();
    this.renderComponents();
    this.initListeners();
    return this.element;
  }

  initComponents() {
    const slider = new DoubleSlider({
      min: 0,
      max: 10000,
      formatValue: (data: any) => `$${data.toLocaleString()}`
    });
    const products = new ProductSortableTable(header, { url: PRODUCTS_URL });
    const emptyPlaceholder = this.getEmptyPlaceholder();
    products.setEmptyPlaceholder(emptyPlaceholder);
    this.components = { slider, products };
  }

  onSelectPrice = ({ detail }: PriceRangeEvent) => {
    const { from: price_gte, to: price_lte } = detail;
    this.filter = { ...this.filter, price_gte, price_lte };
    this.filterProducts(this.filter);
  };

  filterProducts(filters: object) {
    const { products } = this.components;
    const filterProductsUrl = new URL(PRODUCTS_URL, process.env.BACKEND_URL);
    for (const [field, value] of Object.entries(filters)) {
      if (value !== '' && !Number.isNaN(value)) {
        filterProductsUrl.searchParams.set(field, String(value));
      }
    }
    products.setUrl(filterProductsUrl);
  }

  getEmptyPlaceholder() {
    const placeholder = document.createElement('div');
    const btn = document.createElement('button');
    const text = `<p>No products found matching the selected criteria</p>`;

    btn.className = 'button-primary-outline';
    btn.innerText = 'Clear filter';
    btn.onpointerdown = e => this.clearFilter(e);

    placeholder.insertAdjacentHTML('afterbegin', text);
    placeholder.insertAdjacentElement('beforeend', btn);
    return placeholder;
  }

  clearFilter(e: Event) {
    e.preventDefault();
    const { slider, products } = this.components;
    const { filterName, filterStatus } = this.subElements;
    filterName.value = '';
    filterStatus.value = '';
    slider.reset();
    this.filter = this.defaultFilter;
    products.setUrl(new URL(PRODUCTS_URL, process.env['BACKEND_URL']));
  }

  onChangeInput(e: Event) {
    e.preventDefault();
    const { value, name } = e.target as HTMLInputElement;
    this.filter = { ...this.filter, [name]: value };
    this.filterProducts(this.filter);
  }

  initListeners() {
    const { element: sliderElement } = this.components[ComponentsEnum.Slider];
    const { filterName, filterStatus } = this.subElements;
    sliderElement.addEventListener(CUSTOM_EVENTS.SelectRange, this.onSelectPrice as EventListener);
    filterName.addEventListener('keyup', (e: Event) => this.onChangeInput(e));
    filterStatus.addEventListener('change', (e: Event) => this.onChangeInput(e));
  }

  removeListeners() {
    const { element: sliderElement } = this.components[ComponentsEnum.Slider];
    sliderElement.removeEventListener(
      CUSTOM_EVENTS.SelectRange,
      this.onSelectPrice as EventListener
    );
  }

  destroy() {
    super.destroy();
    this.removeListeners();
  }
}

export default ProductsPage;
