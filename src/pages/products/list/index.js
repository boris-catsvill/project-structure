import BasicPage from '../../basic-page';

/**
 * Product list page
 */
export default class extends BasicPage {

  async render() {
    this.element.innerHTML = `<h1>List page</h1>`;
    return super.render();
  }
}
