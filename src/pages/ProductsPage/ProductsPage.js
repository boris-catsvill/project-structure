
import getComponents from "./getComponents"

export default class ProductsPage {
  
  element = null
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

    this.childrenComponents.forEach((childComponent) => childComponent.element?.remove());
    
    this.childrenComponents = this.getComponents(this.range).map(([ChildComponent, nameOfContainerForFilling, inputData]) => {

      const childComponent = new ChildComponent(...inputData);
      childComponent.render();

      this.subElements[nameOfContainerForFilling].append(childComponent.element);
      return childComponent;
    });

    const updatedDataOfChildComponents = this.childrenComponents.map(childComponent => childComponent?.update())
    await Promise.all(updatedDataOfChildComponents)
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

