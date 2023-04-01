export default class NotificationMessage {
  static previousCall;
  element;
  constructor(message = "", { duration = 0, type = "" } = {}) {
    this.text = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getNotificationMessage();
    this.element = wrapper.firstElementChild;
  }

  getNotificationMessage() {
    return `
    <div class="notification ${this.type}" style="--value:
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
    if (NotificationMessage.previousCall) {
      NotificationMessage.previousCall.element.remove();
    }

    targetElement.append(this.element);
    NotificationMessage.previousCall = this;
    setTimeout(() => {
      this.destroy();
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
    if (NotificationMessage.previousCall === this) {
      NotificationMessage.previousCall = null;
    }
  }
}
