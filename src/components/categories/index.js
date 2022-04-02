import SortableList from '../../components/sortable-list/index.js';

export default class CategoriesList {
  element
  subElements = {}

  constructor(category) {
			this.category = category;
      this.render()
	}

  get template() {
    return `
      <div class="category category_open" data-id="${this.category.id}">
        <header class="category__header">
          ${this.category.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list">
          </div>
        </div>
      </div>`
  }

	getSubCategory({subcategories}) {
    const subcategoryList = this.element.querySelector(".subcategory-list")

    const sortableList = new SortableList({
      items: subcategories.map(subcategory => {
        const element = document.createElement('li');

        element.classList = 'categories__sortable-list-item';

        element.dataset.grabHandle = '';
        element.dataset.id = subcategory.id;

        element.innerHTML = `
        <strong>${subcategory.title}</strong>
				<span><b>${subcategory.count}</b> products</span>
      `

        return element;
      })
    })

    subcategoryList.append(sortableList.element);
    return subcategoryList
  }

  render() {
    const wrapper = document.createElement(`div`);
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.getSubCategory(this.category)

    this.intEventListener();
		return this.element;
  }

  intEventListener() {
    const tmp = this.element.querySelector(".category__header")
    tmp.addEventListener("pointerdown", (e) => {
      const tmp = e.target.closest(".category");
      tmp.classList.toggle("category_open");
    })
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
