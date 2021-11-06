export default class NotificationMessage {
  static activeMessage;
  element;

  constructor(message, { duration = 1000, type = "success" } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;
    this.createElement();
  }
  get template() {
    return /*html*/ `
      <div class="notification notification_${this.type}" style="--value:${
      this.duration / 1000
    }s">
        <div class="notification__content notification__content_show">
            ${this.message}
        </div>
      </div>
    `;
  }
  createElement() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }
  show(target = document.body) {
    if (NotificationMessage.activeMessage)
      NotificationMessage.activeMessage.remove();

    target.append(this.element);

    this.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);

    NotificationMessage.activeMessage = this;
  }
  remove() {
    clearTimeout(this.timerId);
    if (this.element) this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeMessage = null;
  }
}
