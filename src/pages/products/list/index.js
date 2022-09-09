import SortableTable from "../../../components/sortable-table";
import { header } from './header';

export default class Page {
  element;
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
    this.components.sortableTable = new SortableTable(header, {
      url: 'api/rest/products'
    });

  }

  async renderComponents() {
    const element = await this.components.sortableTable.render();

    this.element.append(element);
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}
