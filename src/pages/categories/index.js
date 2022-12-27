import BasicPage from '../basic-page';

/**
 * Categories page
 */
export default class extends BasicPage {

  async render() {
    this.element.innerHTML = `<h1>Categories</h1>`;
    return super.render();
  }
}
