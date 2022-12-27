import BasicPage from '../../basic-page';

/**
 * Product edit page
 */
export default class extends BasicPage {

  async render() {
    this.element.innerHTML = `<h1>Edit page</h1>`;
    return super.render();
  }
}
