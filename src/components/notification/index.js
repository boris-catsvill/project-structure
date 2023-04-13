export default class NotificationMessage {
  static timer = null;
  static visibleElement = null;

  constructor(message, { duration = 1000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration}ms">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.message}
        </div>
      </div>
      </div>
      `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(target = document.body) {
    this.remove();
    NotificationMessage.visibleElement = this.element;
    target.append(this.element);
    NotificationMessage.timer = setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    if (!NotificationMessage.visibleElement) return;
    clearTimeout(NotificationMessage.timer);
    NotificationMessage.visibleElement.remove();
    NotificationMessage.visibleElement = null;
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
