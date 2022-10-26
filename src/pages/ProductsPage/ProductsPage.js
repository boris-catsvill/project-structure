
import getComponents from "./getComponents"

export default class ProductsPage {

  subElements = {}
  getComponents = getComponents
  childrenComponents = []

  mainClass = null
  path = null
  range = {
    from: null,
    to: null
  }

  get elementDOM() {
    const wrapper = document.createElement('div');
    const products = `
        <div class="products-list">
            <div class="content__top-panel">
                <h1 class="page-title">Товары</h1>
                <a href="/products/add" class="button-primary" data-element="addProductBtn">Добавить товар</a>
            </div>
            <div data-element="sortableTable" class="products-list__container"></div>
        </div>`;
    wrapper.innerHTML = products;
    return wrapper.firstElementChild;
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  async update() {
    this.childrenComponents.forEach((component) => component.element?.remove());
    
    this.childrenComponents = this.getComponents(this.range).map(([ComponentChild, containerName, inputData]) => {
      const component = new ComponentChild(...inputData);
      component.render();
      this.subElements[containerName].append(component.element);
      return component
    });

    const updateComponents = this.childrenComponents.map(componentChild => componentChild?.update())
    await Promise.all(updateComponents)
  }

  async render(mainClass, range) {
    this.mainClass = mainClass;
    this.range = {
      from: new Date(range.from),
      to: new Date(range.to)
    };

    this.element = this.elementDOM;
    this.setSubElements();
  }

  remove() {
    this.element?.remove();
    this.element = null;
  }

  destroy() {
    this.childrenComponents.forEach((component) => component?.destroy())
    this.remove();
  }
}

