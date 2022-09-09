export default class NotificationMessage {
  static currentNotification;

  constructor(
    message = "",
    {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
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
    const notificationWrapper = document.createElement("div");
    notificationWrapper.innerHTML = this.template;

    this.element = notificationWrapper.firstElementChild;
  }

  show(parent = document.body) {
    if (NotificationMessage.currentNotification) {
      NotificationMessage.currentNotification.remove();
    }
    NotificationMessage.currentNotification = this.element;
    parent.append(this.element);
    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }
}
