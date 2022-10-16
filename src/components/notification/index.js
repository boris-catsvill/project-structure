export default class NotificationMessage {
  constructor(message = '', { type = 'error', duration = 0 } = {}) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.render();
  }

  clearTimer() {
    if (NotificationMessage.timer) {
      clearTimeout(NotificationMessage.timer);
    }
  }
  checkElementNotification() {
    if (NotificationMessage.element) {
      NotificationMessage.element?.remove();
    }
    this.clearTimer();
  }
  getTemplate() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">

      <div class="notification__content">
        
          ${this.message}

      </div>
      </div>
      
     `;
    return wrapper.firstElementChild;
  }
  render() {
    this.checkElementNotification();
    this.element = this.getTemplate();
    NotificationMessage.element = this.element;
  }
  show(element = document.body) {
    element.append(NotificationMessage.element);
    NotificationMessage.timer = setTimeout(() => this.remove(), this.duration);
  }
  remove() {
    this.element?.remove();
    this.clearTimer();
  }
  destroy() {
    this.remove();
  }
}
