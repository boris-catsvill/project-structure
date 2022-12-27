import BasicPage from '../basic-page';

/**
 * Sales page
 */
export default class extends BasicPage {

  async render() {
    this.element.innerHTML = `<h1>Sales page</h1>`;
    return super.render();
  }
}
