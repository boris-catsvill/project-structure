export default class NotificationMessage {
  static previousInstance;
  element;
  constructor(message = '', { duration = 0, type = '' } = {}) {
    this.text = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getNotificationMessage();
    this.element = wrapper.firstElementChild;
  }

  getNotificationMessage() {
    return `
    <div class="notification notification_${this.type} show" style="--value:
    ${this.duration / 1000}s">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.text}
      </div>
    </div>
  </div>
    `;
  }

  show(targetElement = document.body) {
    if (NotificationMessage.previousInstance) {
      NotificationMessage.previousInstance.element.remove();
    }

    targetElement.append(this.element);
    NotificationMessage.previousInstance = this;
    this.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    clearTimeout(this.timerId);
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;

    NotificationMessage.previousInstance = null;
  }
}
