export default class NotificationMessage {
  constructor(message = "", { duration = 0, type = "error" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get templateHTML() {
    const timer = this.duration * 0.001;
    return `<div
      class="notification ${this.type}"
      style="--value:${timer}s"
    >
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
  </div>`;
  }

  checkElement() {
    this.removeGlobalElement();
    this.removeGlobalTimeout();
  }

  render() {
    this.checkElement();

    const element = document.createElement("div");
    element.innerHTML = this.templateHTML;
    NotificationMessage.element = element.firstElementChild;
    this.element = element.firstElementChild;
  }

  show(element = document.body) {
    element.append(NotificationMessage.element);
    NotificationMessage.timeout = setTimeout(
      () => this.remove(),
      this.duration
    );
  }

  removeGlobalElement() {
    NotificationMessage.element?.remove();
  }

  removeGlobalTimeout() {
    if (NotificationMessage.timeout) {
      clearTimeout(NotificationMessage.timeout);
    }
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
