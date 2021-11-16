export default class NotificationMessage {
  static activeNotification;
  element;
  timerId;

  constructor(message = '', {type = '', duration = 2000} = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.durationInSeconds = (this.duration / 1000) + 's';

    this.render();
  }

  get template () {
    return `
      <div class="notification notification_${this.type} show">
        <div class="notification__content">${this.message}</div>
      </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  show(parent = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    parent.append(this.element);

    this.timerId = setTimeout(() => this.remove(), this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    clearTimeout(this.timerId);

    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }
}
