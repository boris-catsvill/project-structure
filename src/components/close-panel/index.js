export default class ClosePanel {
  initialize() {
    this.toggleButton = document.querySelector('.sidebar__toggler');
    this.toggleButton.addEventListener('pointerdown', this.toggleClass);
  }

  toggleClass() {
    document.body.classList.toggle('is-collapsed-sidebar');
  }
  destroy() {
    this.toggleButton.removeEventListener('pointerdown', this.toggleClass);
  }
}
