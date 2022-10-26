
import getComponents from "./getComponents"

export default class ProductFormPage {
    subElements= {}
    element = null
    productId = (document.location.pathname.match(/([a-z0-9_-]+$)/i) ?? [])[0]

    getComponents = getComponents
    childrenComponents = []
    mainClass = null

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
      this.childrenComponents.forEach((component) => component.element?.remove());
      
      this.childrenComponents = this.getComponents().map(([ComponentChild, containerName, inputData]) => {
        const component = new ComponentChild(...inputData);
        component.render();
        this.subElements[containerName].append(component.element);
        return component
      });
  
      const updateComponents = this.childrenComponents.map(componentChild => componentChild?.update())
      await Promise.all(updateComponents)
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