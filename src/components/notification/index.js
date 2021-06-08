export default class NotificationMessage {
  static isVisible = false;
  element;

  constructor(message = '', {
    duration = 5000,
    type = ''
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  createTemplate() {
    const time = this.duration / 1000;
    return `
      <div class="notification ${this.type}" style="--value: ${time}s">
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">${this.message}</div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.createTemplate();
    this.element = element.firstElementChild;
  }

  show(targetElement = document.body) {
    if (NotificationMessage.isVisible) {
      document.body.querySelector('.notification').remove();
    } else {
      NotificationMessage.isVisible = true;
    }

    targetElement.append(this.element);

    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    NotificationMessage.isVisible = false;
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
