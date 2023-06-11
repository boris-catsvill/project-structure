import SortableList from '../sortable-list';
import { BaseComponent } from '../../base-component';
import { TypeBaseComponents } from '../../types/base';

export default class Categories extends BaseComponent implements BaseComponent {
  components: TypeBaseComponents;
  subCategories;
  id;
  title;
  isOpen;

  constructor({ id = '', title = '', subcategories = [] }, isOpen = true) {
    super();
    this.subCategories = subcategories;
    this.id = id;
    this.title = title;
    this.isOpen = isOpen;
    this.render();
  }

  get template() {
    return `<div class='category ${this.isOpen ? 'category_open' : ''}' data-id='${this.id}'>
              <header class='category__header'>${this.title}</header>
              <div class='category__body'>
                <div data-element='subCategoryList' class='subcategory-list'></div>
              </div>
           </div>`;
  }

  render() {
    super.render();
    this.initComponents();
    this.renderComponents();
    this.initListeners();
  }

  initComponents() {
    const items = this.subCategories.map(subcategory => this.getSubCategoryElement(subcategory));
    const subCategoryList = new SortableList(items);
    this.components = { subCategoryList };
  }

  renderComponents() {
    for (const [name, component] of Object.entries(this.components)) {
      const root = this.subElements[name];
      const { element } = component;
      root.insertAdjacentElement('beforeend', element);
    }
  }

  toggle() {
    this.element.classList.toggle('category_open');
    this.isOpen = !this.isOpen;
  }

  initListeners() {
    const header = this.element.querySelector('.category__header');
    header?.addEventListener('pointerdown', () => this.toggle());
  }

  getSubCategoryElement({ id = '', title = '', count = 0 } = {}) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<li class='categories__sortable-list-item sortable-list__item' data-grab-handle='' data-id='${id}'>
                        <strong>${title}</strong>
                        <span><b>${count}</b> products</span>
                      </li>`;
    return wrap.firstElementChild;
  }

  destroy() {
    super.destroy();
    this.subCategories = [];
  }
}
