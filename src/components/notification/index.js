export default class NotificationMessage {
  message;
  duration;
  type;
  element;


  constructor(message = '', options = {duration: 2000, type: 'success'}) {
    this.message = message;
    Object.assign(this, {...options});
    this.createElement();
  }

  createElement() {
    const element = document.createElement('div');
    element.innerHTML = this.getBody();
    this.element = element.firstElementChild;
  }

  getBody() {
    return `
      <div class="notification notification_${this.type}">
        <div class="notification__content">
          ${this.message}
        </div>
      </div>
    `;
  }

  show(elem = document.body) {
    elem.append(this.element);
    this.element.classList.add('show');
    setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    this.destroy();
  }

  destroy() {
    this.element?.remove();
  }
}
