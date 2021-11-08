import Categories from "../../components/categories/index.js";
import Notification from "../../components/notification/index.js";

export default class Page {
  element;
  subElements = {};
  components = {};

  initComponents() {
    const categories = new Categories({
      urls: {
        categories: "api/rest/categories?_sort=weight&_refs=subcategory",
        subcategories: "api/rest/subcategories",
      },
    });
    this.components = {
      categories,
    };
  }
  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      if (element) root.append(element);
    });
  }

  get template() {
    return `
      <div class="categories">
        <div class="content__top-panel">
          <h1 class="page-title">Categories products</h1>
        </div>
        <div data-element="categories">
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  initEventListeners() {
    document.addEventListener("event-successPost", () => {
      const notification = new Notification(
        "Changes have been done successfully",
        {
          duration: 3000,
          type: "success",
        }
      );
      notification.show();
    });
  }

  remove() {
    if (this.element) this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
