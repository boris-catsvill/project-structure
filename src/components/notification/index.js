export default class NotificationMessage {
  static activeNotification;

  element;
  timerId;

  constructor(message = '', {duration = 0, type = ''} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
            <div class="notification-header">Notification</div>
            <div class="notification-body">
                ${this.message}
             </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
  }

  show(parentElement = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    parentElement.append(this.element);

    this.timerId = setTimeout(() => {
      this.destroy();
    }, this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    if (this.element) {
      clearTimeout(this.timerId);
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
