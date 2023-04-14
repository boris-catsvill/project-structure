import Tooltip from '../tooltip/index.js';
import ClosePanel from '../close-panel/index.js';
import header from './sidebar-config.js';

export default class App {
  constructor() {
    this.render();
    new Tooltip().initialize();
  }
  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.getClosePanel();
    document.body.append(this.element);
  }
  getTemplate() {
    return `
    <main class="main">
    <div class="progress-bar">
      <div class="progress-bar__line"></div>
    </div>
    <aside class="sidebar">
      <h2 class="sidebar__title">
        <a href="/">shop admin</a>
      </h2>
      <ul class="sidebar__nav">
      ${this.getSidebarList()}
      </ul>
    </aside>
    <section class="content" id="content"></section>
  </main>
    `;
  }
  getSidebarList() {
    return header
      .map(item => {
        return `<li> <a href="${item.url}" data-page="${item.dataname}">
        <i class="${item.icon}"></i> <span>${item.title}</span> </a> </li>`;
      })
      .join('');
  }
  getClosePanel() {
    const { element } = new ClosePanel();
    this.element.querySelector('.sidebar').append(element);
  }
}
