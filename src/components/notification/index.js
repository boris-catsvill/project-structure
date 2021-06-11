export default class NotificationMessage {
  static lastNotification;

  constructor(message = '', { duration = 3000, type = 'success' } = {}) {
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
      <div class="notification notification_${this.type} show"">
        <div class="notification__content">
          ${this.message}
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
