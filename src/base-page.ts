import { TypeBaseComponents } from './types/base';
import { BaseComponent } from './base-component';

export class BasePage extends BaseComponent {
  components: TypeBaseComponents;

  renderComponents() {
    if (this.components) {
      for (const [name, component] of Object.entries(this.components)) {
        const root = this.subElements[name];
        const { element } = component;
        root.insertAdjacentElement('beforeend', element);
      }
    }
  }

  destroy() {
    super.destroy();
    if (this.components) {
      Object.values(this.components).forEach(component => component.destroy());
    }
  }
}
