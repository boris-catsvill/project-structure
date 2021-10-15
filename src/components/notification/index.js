export default class Notification {

  static currentNotification = null;

  constructor(message = '', {duration = 2000, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = `
      <div class="notification notification_${this.type} show">
        <div class="notification-body notification__content">${this.message}</div>
      </div>
    `;
    this.element = this.element.firstElementChild;
  }

  show(element = document.body) {
    if (Notification.currentNotification) {
      Notification.currentNotification.remove();
    }

    element.append(this.element);

    this.timeoutId = setTimeout(() => {this.remove()}, this.duration)
    Notification.currentNotification = this;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    clearTimeout(this.timeoutId);
  }

  destroy() {
    this.remove();
    this.element = null;
    Notification.currentNotification = null;
  }
}
