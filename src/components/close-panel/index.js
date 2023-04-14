export default class ClosePanel {
  toggleClass = event => {
    if (!event.target.closest('.sidebar__toggler')) {
      return;
    }
    document.body.classList.toggle('is-collapsed-sidebar');
  };

  constructor() {
    this.render();
  }
  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.initEventListeners();
  }
  getTemplate() {
    return `
    <ul class="sidebar__nav sidebar__nav_bottom">
    <li>
      <button type="button" class="sidebar__toggler">
        <i class="icon-toggle-sidebar"></i> <span>Скрыть панель</span>
      </button>
    </li>
  </ul>
    `;
  }
  initEventListeners() {
    this.element.addEventListener('pointerdown', this.toggleClass);
  }

  destroy() {
    this.element.removeEventListener('pointerdown', this.toggleClass);
  }
}
