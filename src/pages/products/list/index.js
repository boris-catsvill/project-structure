// import ProductForm from '../../../components/product-form';
import DoubleSlider from '../../../components/double-slider';
import SortableTable from '../../../components/sortable-table';
import header from './products-header';

export default class ProductListPage {
  element;
  subElements = {};
  components = {};

  async renderMinMaxSlider() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('_embed', 'subcategory.category');
    url.searchParams.set('_sort', 'price');
    url.searchParams.set('_order', 'asc');
    url.searchParams.set('_start', '0');
    url.searchParams.set('_end', '30');

    console.log(url);

    try {
      const response = await fetch(url);
      const data = await response.json();
      let min = data;
      console.log('min', min);
      return data;
    } catch (error) {
      console.log(error);
    }

    url.searchParams.set('_order', 'desc');

    try {
      const response = await fetch(url);
      const data = await response.json();
      let max = data;
      console.log('max', max);
      return data;
    } catch (error) {
      console.log(error);
    }
  }
  // _embed=subcategory.category&price_gte=1315&price_lte=4000&_sort=title&_order=asc&_start=0&_end=30

  async renderComponents() {
    const { sortableTable, doubleSlider } = this.subElements;
    this.url = new URL('api/rest/products', process.env.BACKEND_URL);
    this.url.searchParams.set('_embed', 'subcategory.category');

    console.log(this.url);

    await this.renderMinMaxSlider();

    // this.url.searchParams.set('price_gte', this.minSlider);
    // this.url.searchParams.set('price_lte', this.maxSlider);

    console.log(this.url);

    this.doubleSliderElement = new DoubleSlider({ min: this.minSlider, max: this.maxSlider }); 

    this.sortableTableElement = new SortableTable(header, { url: this.url });

    sortableTable.append(this.sortableTableElement.element);
    doubleSlider.append(this.doubleSliderElement.element);
  }

  // <div class="form-group" data-element="sliderContainer">
  //           <label class="form-label">Price:</label>
  //           <div class="range-slider">
  //             <span data-elem="from">$0</span>
  //             <div data-elem="inner" class="range-slider__inner">
  //               <span
  //                 data-elem="progress"
  //                 class="range-slider__progress"
  //                 style="left: 0%; right: 0%"
  //               ></span>
  //               <span
  //                 data-elem="thumbLeft"
  //                 class="range-slider__thumb-left"
  //                 style="left: 0%"
  //               ></span>
  //               <span
  //                 data-elem="thumbRight"
  //                 class="range-slider__thumb-right"
  //                 style="right: 0%"
  //               ></span>
  //             </div>
  //             <span data-elem="to">$4000</span>
  //           </div>
  //         </div>

  get template() {
    return `
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
      <div class="content-box content-box_small">
        <form class="form-inline">
          <div class="form-group">
            <label class="form-label">Sort by:</label>
            <input
              type="text"
              data-elem="filterName"
              class="form-control"
              placeholder="Product name"
            />
          </div>
          <div data-element="doubleSlider">
            <!-- double-slider component -->
          </div>
          <div class="form-group">
            <label class="form-label">Status:</label>
            <select class="form-control" data-elem="filterStatus">
              <option value="" selected="">Any</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
        </form>
      </div>
      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    await this.renderComponents();

    // this.initComponents();
    // await this.renderComponents();

    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element; 
      result[name] = subElement;
    }
    console.log(result);
    return result;
  }

  // initComponents() {
  //   const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';

  //   this.components.productFrom = new ProductForm(productId);
  // }

  // async renderComponents() {
  //   const element = await this.components.productFrom.render();

  //   this.element.append(element);
  // }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
