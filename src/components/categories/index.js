import BasicComponent from '../basic-component';
import SortableList from '../sortable-list';
import escapeHtml from '../../utils/escape-html';

export default class Category extends BasicComponent {

  constructor({
    id = '',
    title = '',
    subItems = [],
    itemTemplate = item => `<strong>${escapeHtml(item.title)}</strong>`
  }) {
    super();
    this.id = id;
    this.title = title;
    this.subItems = subItems;
    this.itemTemplate = itemTemplate;

    this.render();
  }

  async render() {
    this.element.classList.add('category', 'category_open');
    this.element.dataset.id = this.id;
    this.element.innerHTML = this.getTemplate();

    this.subElements = BasicComponent.findSubElements(this.element);

    this.subElements.header.addEventListener('click', event => {
      event.preventDefault();
      this.element.classList.toggle('category_open');
    });

    this.sortableList = new SortableList({
      items: this.subItems.map(item => this.createItemElement(item))
    });

    this.subElements.sortableList.append(this.sortableList.element);

    return super.render();
  }

  getTemplate() {
    return `<header class='category__header' data-element='header'>${escapeHtml(this.title)}</header>
  <div class='category__body'>
    <div class='subcategory-list' data-element='sortableList'><!-- SortableList --></div>
  </div>`;
  }

  destroy() {
    this.sortableList.destroy();
    this.sortableList = null;
    super.destroy();
  }

  createItemElement(item) {
    const el = document.createElement('li');
    el.classList.add('categories__sortable-list-item', 'sortable-list__item');
    el.dataset.id = item.id;
    el.dataset.grabHandle = '';
    el.innerHTML = this.itemTemplate(item);
    return el;
  }
}
