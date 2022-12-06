export default class NotificationMessage {
  static activeComponent;

  element;

  constructor(message, { duration, type } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
        <div class="notification notification_${this.type} show" style="--value:${
      this.duration / 1000
    }s">
          <div class="notification__content">
            ${this.message}
          </div>
        </div>
      `;
  }

  render() {
    if (NotificationMessage.activeComponent) {
      NotificationMessage.activeComponent.remove();
    }

    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    NotificationMessage.activeComponent = this.element;
  }

  show(parent = document.body) {
    parent.append(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
