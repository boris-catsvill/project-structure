export default class NotificationMessage {
  static NotificationObj;

  constructor(textMessage = '', { duration = 2000, type = 'success' } = {}) {
    this.textMessage = textMessage;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `
    <div class="notification notification_${this.type} show">
      <div class="notification__content">${this.textMessage}</div>
    </div>`;
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  show(targetElement = document.body) {
    if (NotificationMessage.NotificationObj) {
      NotificationMessage.NotificationObj.destroy();
    }
    NotificationMessage.NotificationObj = this;

    targetElement.append(this.element);
    this.timerId = setTimeout(() => {
      NotificationMessage.NotificationObj.destroy();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    clearTimeout(this.timerId);
    this.element = null;
    NotificationMessage.NotificationObj = null;
  }
}
