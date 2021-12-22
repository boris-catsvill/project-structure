import SortableList from '../sortable-list';
import { findSubElements } from '../../utils/find-sub-elements';


export default class Category {
  element;
  subElements = {
    containerCategories: void 0
  };
  category = {
    subcategories: []
  };

  updateOrders = () => void 0;

  constructor({ category, updateOrders }) {
    this.category = category;
    this.updateOrders = updateOrders;
    this.render();
  }

  getSubcategoryTemplate = (subcategory) => `
    <li class='categories__sortable-list-item sortable-list__item' data-grab-handle='' data-id='${subcategory.id}'>
                  <strong>${subcategory.title}</strong>
                  <span><b>${subcategory.count}</b> products</span>
    </li>
  `;

  getTemplate = () => {
    const { id, title } = this.category;
    return `
    <div class='category category_open' data-id='${id}'>
      <header class='category__header'>
        ${title}
      </header>
      <div class='category__body' >
      <div class='subcategory-list' data-element='containerCategories'>

      </div>
      </div>
    </div>
  `;
  };

  addSubCategories = () => {
    this.subElements = findSubElements(this.element);
    const { subcategories } = this.category;
    const items = subcategories.map(
      subcategory => {
        const element = document.createElement('div');
        element.innerHTML = this.getSubcategoryTemplate(subcategory);
        return element.firstElementChild;
      }
    );

    const list = new SortableList({ items });

    this.subElements.containerCategories.append(list.element);
  };

  switchOrder = ({ from, to }) => {
    const without = this.category.subcategories.filter((subcategory, index) => index !== from);
    without.splice(to, 0, this.category.subcategories[from]);
    return without.map((item, index) => ({ id: item.id, weight: index + 1 }));
  };

  initUpdateOrder = (event) => {
    const payload = this.switchOrder(event.detail);
    this.updateOrders(payload);
  };

  initEventListener = () => {
    this.element.addEventListener('sortable-list-reorder', this.initUpdateOrder);
  };

  render = () => {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
    this.addSubCategories();
    this.initEventListener();
    return this.element;

  };
  remove = () => {
    this.element.remove();

  };
  destroy = () => {
    this.remove();
    this.subElements = {};
    this.element.removeEventListener('sortable-list-reorder', this.initUpdateOrder);
  };
}

