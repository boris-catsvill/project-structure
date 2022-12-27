/**
 * Product list page
 */
export default class Page {
  subElements = {};
  components = {};

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div>
        <h1>List page</h1>
      </div>`;

    this.element = element.firstElementChild;

    this.initComponents();
    await this.renderComponents();

    return this.element;
  }

  initComponents() {
  }

  async renderComponents() {
    for (const component of Object.values(this.components)) {
      await component.render();
      this.element.append(component.element);
    }
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
