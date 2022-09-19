export default class NotificationMessage {
  static classElem;

  constructor(message = "", { duration = 2000, type = "success" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `
    <div class="notification" style="--value: ${this.duration * 0.001}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">${this.message}</div>
      </div>
    </div>
        `;
  }

  render() {
    const element = document.createElement("div");

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    this.element.classList.add(this.type);
  }

  show(target = document.body) {
    target.append(this.element);

    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove();
    }

    this.intervalId = setTimeout(() => {
      return this.remove();
    }, this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    clearTimeout(this.intervalId);

    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
