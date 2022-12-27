import BasicPage from '../basic-page';

/**
 * Dashboard page
 */
export default class extends BasicPage {

  async render() {
    this.element.innerHTML = `<h1>Dashboard</h1>`;
    return super.render();
  }
}
