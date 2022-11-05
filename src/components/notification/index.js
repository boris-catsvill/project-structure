export default class NotificationMessage {
  static activeMessage;
  element;

  constructor(message = '', { duration = 2000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
    this.show();
  }

  render() {
    if (this.message.length !== 0) {
      const element = document.createElement('div');
      element.innerHTML = this.template;
      this.element = element.firstElementChild;
    }
  }

  show(parent = document.body) {
    if (NotificationMessage.activeMessage) {
      NotificationMessage.activeMessage.remove();
    }
    parent.append(this.element);
    this.element.classList.add('show');

    setTimeout(() => {
      this.remove();
    }, this.duration);
    NotificationMessage.activeMessage = this;
  }

  get template() {
    return `
      <div class="notification notification_${this.type}">
        <div class="notification__content">
          ${this.message}
        </div>
      </div>
      `;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeMessage = null;
  }
}
