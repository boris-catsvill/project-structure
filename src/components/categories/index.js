import Component from "../../utils/component";

export default class CategoryExpandPanel extends Component {
  handleExpandCategoryPanel = () => {
    this.element.classList.toggle('category_open');
  }

  constructor({ 
    title = '', 
    id = '' 
  } = {}) {
    super();

    this.title = title;
    this.id = id;
  }

  get template() {
    const { id, title } = this;

    return (
      `<div class="category category_open" id="${id}">
        <header class="category__header" data-element="header">${title}</header>
        <div class="category__body">
          <div class="subcategory-list" data-element="category-body-${id}"></div>
        </div>
      </div>`
     )
  }

  slot(component) {
    const body = this.getChildElementByName(`category-body-${this.id}`);
    body.append(component);
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.handleExpandCategoryPanel); 
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this.handleExpandCategoryPanel); 
  }
}