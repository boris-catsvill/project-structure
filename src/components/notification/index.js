export default class NotificationMessage {
  static lastNotification;

  constructor(message = '', { duration = 1000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.show();
  }

  show(target = document.body) {
    if (NotificationMessage.lastNotification) {
      NotificationMessage.lastNotification.remove();
    }

    this.render();
    target.append(this.element);
    NotificationMessage.lastNotification = this.element;

    setTimeout(() => this.destroy(), this.duration);
  }

  get template() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
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
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;

    this.element = this.element.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
