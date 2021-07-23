export default class NotificationMessage {
  element;
  timerId;
  static activeNotification;
  constructor(label = '', {duration = 2000, type = 'success'} = {}) {
    this.label = label;
    this.type = type;
    this.duration = duration;

    this.createElement();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.classList.add('notification', this.type ? this.type : null);
    this.element.style.setProperty('--value', `${this.duration / 1000}s`);

    this.element.innerHTML = `
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.label}
        </div>
      </div>
    `;
  }

  show(target = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.destroy();
    }
    target.append(this.element);
    this.timerId = setTimeout(() => this.destroy(), this.duration);
    NotificationMessage.activeNotification = this;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    clearTimeout(this.timerId);
    NotificationMessage.activeNotification = null;
  }
}
