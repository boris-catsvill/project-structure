export default class NotificationMessage {
  static activeMessage;

  constructor(message, {
    duration = 2000,
    type = 'success',
  } = {}) {
    if (NotificationMessage.activeMessage) {
      NotificationMessage.activeMessage.remove();
    }

    this.message = message;
    this.durationInSeconds = (duration / 1000) + 's';
    this.type = type;
    this.duration = duration;

    this.render();
  }

  get template() {
    return `<div class="notification ${this.type}" style="--value:${this.durationInSeconds}">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">Notification</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    NotificationMessage.activeMessage = this.element;
  }

  show(parent = document.body) {
    parent.append(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeMessage = null;
  }
}
