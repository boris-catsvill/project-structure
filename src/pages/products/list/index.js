import SortableTable from '../../../components/sortable-table';
import FilterForm from '../../../components/filter-form';
import header from './products-list-header';
import { findSubElements } from '../../../utils/find-sub-elements';

const PAGE_PRODUCTS_TITLE = 'Товары';
const ADD_PRODUCTS_LABEL = 'Добавить товар';


const PRODUCTS_URL = '/api/rest/products?_embed=subcategory.category';

export default class PageListProducts {
  element;
  subElements = {};
  components = {};


  productsTableCreator = () => (new SortableTable(
    header,
    { url: PRODUCTS_URL, rowClickUrl: '/products/' }
  ));
  filterFormCreator = () => (new FilterForm());

  renderComponents = async () => {
    this.subElements = findSubElements(this.element);
    this.sortableTable = await this.productsTableCreator();
    this.filterForm = this.filterFormCreator();
    this.subElements.sortableTable.append(this.sortableTable.element);
    this.subElements.filterForm.append(this.filterForm.element);
  };

  getTemplate = () => {
    return `
      <div class='products-list'>
        <div class='content__top-panel'>
          <h1 class='page-title'>${PAGE_PRODUCTS_TITLE}</h1>
            <a href='/products/add' class='button-primary'>${ADD_PRODUCTS_LABEL}</a>
        </div>
        <div class='content-box content-box_small'>
          <div data-element='filterForm'></div>
         </div>
        <div data-elem='productsContainer' class='products-list__container'>
          <div data-element='sortableTable'></div>
        </div>
      </div>`;
  };

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    await this.renderComponents();
    return this.element;
  }

  remove = () => {
    this.element.remove();
  };

  destroy = () => {
    this.remove();
    this.subElements = {};
    this.sortableTable.destroy();
  };
}
