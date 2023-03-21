export default class NotificationMessage {
  static currentElement;

  constructor(title = '', { duration = 1000, type = 'success' } = {}) {
    this.title = title;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
        ${this.title}
        </div>
      </div>
    </div>
      `;
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  show(elem = document.body) {
    if (NotificationMessage.currentElement) {
      NotificationMessage.currentElement.remove();
    }
    elem.append(this.element);
    NotificationMessage.currentElement = this;
    setTimeout(() => this.remove(), this.duration);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
