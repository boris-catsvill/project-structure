export default class NotificationMessage {
  static activeMessage = null;

  constructor(message = '', { duration = 0, type = '' } = {}) {
    this.message = message;
    this.duration = duration;
    this.animationDuration = duration / 1000 + 's';
    this.type = type;

    this.render();
  }

  get template() {
    return `<div class="notification ${this.type}" style="--value:${this.animationDuration}">
    <div class="timer"></div>
    <div class="inner-wrapper">
      <div class="notification-header">${this.type}</div>
      <div class="notification-body">
        ${this.message}
      </div>
    </div>
  </div>`;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;

    this.element = wrapper.firstElementChild;
  }

  replaceActiveMessage() {
    if (NotificationMessage.activeMessage !== null) {
      NotificationMessage.activeMessage.remove();
    }

    NotificationMessage.activeMessage = this;
  }

  show(target = document.body) {
    this.replaceActiveMessage();

    target.append(this.element);

    this.scheduleRemoval();
  }

  scheduleRemoval() {
    clearTimeout(this.timer);

    this.timer = setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
    if (NotificationMessage.activeMessage === this) {
      NotificationMessage.activeMessage = null;
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
