export default class NotificationMessage {
  static currentInstance;

  constructor(message = '', { duration = 1000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `<div class="notification ${this.type} show">
              <div class="notification__content">${this.message}</div>
            </div>`;
  }

  render() {
    let element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.currentInstance) {
      NotificationMessage.currentInstance.remove();
    }

    target.append(this.element);

    NotificationMessage.currentInstance = this;

    this.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      clearInterval(this.timerId);
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.currentInstance = null;
  }
}
