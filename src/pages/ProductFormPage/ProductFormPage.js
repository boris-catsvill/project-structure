
import getComponents from "./getComponents"

export default class ProductFormPage {

  element = null
  subElements = {}

  getComponents = getComponents
  childrenComponents = []
  mainClass = null

  constructor() {
  const  [estimatedId] = document.location.pathname.match(/([a-z0-9_-]+$)/i) ?? [];
  this.productId = estimatedId === 'add' ? null : estimatedId;
  }

  get elementDOM() {

    const wrapper = document.createElement('div');
    const bodyOfWrapper = `
        <div class="products-edit">
          <div class="content__top-panel">
            <h1 class="page-title">
              <a href="/products" class="link">Товары</a> / ${this.productId ? 'Редактировать' : 'Создать'}
            </h1>
          </div>
          <div class="contentBox" data-element="productForm"></div>
        </div>`;

    wrapper.innerHTML = bodyOfWrapper;
    return wrapper.firstElementChild;
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

  setSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  render(mainClass) {
    this.mainClass = mainClass;
    this.element = this.elementDOM;
    this.setSubElements();
  }

  remove() {
    this.element.remove();
    this.element = null;
  }

  destroy() {
    this.childrenComponents.forEach((component) => component?.destroy())
    this.remove();
  }
}