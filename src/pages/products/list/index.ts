//import ProductForm from '../../../components/product-form';
import menu from '../../../components/sidebar/menu';
import { INodeListOfSubElements, IPage, SubElementsType } from '../../../types/types';
import DoubleSlider from '../../../components/double-slider';
import SortableTable from '../../../components/sortable-table';
import header from './header';

enum Components {
  Products = 'products',
  Slider = 'slider'
}

const PRODUCTS_URL = 'api/rest/products?_embed=subcategory.category';

class ProductsPage implements IPage {
  element: Element;
  subElements = {};
  components = {};

  get type() {
    return menu.products.page;
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
            <label class='form-label'>Сортировать по:</label>
            <input type='text' data-element='filterName' class='form-control' placeholder='Название товара'>
          </div>
          <div class='form-group' data-element='${Components.Slider}'>
            <label class='form-label'>Price:</label>
          </div>
          <div class='form-group'>
            <label class='form-label'>Статус:</label>
            <select class='form-control' data-element='filterStatus'>
              <option value='' selected=''>Любой</option>
              <option value='1'>Активный</option>
              <option value='0'>Неактивный</option>
            </select>
          </div>
        </form>
                
              </div>
              <div class='products-list__container' data-element='${Components.Products}'>
                  
              </div>
            </div>`;
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild!;
    this.subElements = this.getSubElements(this.element);
    this.initComponents();
    this.renderComponents();
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
    const products = new SortableTable(header, { url: PRODUCTS_URL });
    this.components = { slider, products };
  }

  async renderComponents() {
    Object.keys(this.components).forEach(component => {
      // @ts-ignore
      const root = this.subElements[component];
      // @ts-ignore
      const { element } = this.components[component];
      root.append(element);
    });
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
  }
}

export default ProductsPage;
