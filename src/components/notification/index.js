export default class NotificationMessage {
  static curNotificationObj;

  constructor(textMessage = '', {
    duration = 2000,
    type = 'success'
  } = {}) {
    this.textMessage = textMessage;
    this.duration = duration;
    this.type = type;

    //init element
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
  }

  getTemplate() {
    return `
    <div class="notification notification_${this.type} show">
      <div class="notification__content">${this.textMessage}</div>
    </div>`;
  }

  show(targetElement = document.body) {

    if (NotificationMessage.curNotificationObj) {
      NotificationMessage.curNotificationObj.destroy();
    }
    NotificationMessage.curNotificationObj = this;

    targetElement.append(this.element);
    this.timerId = setTimeout(() => {
      NotificationMessage.curNotificationObj.destroy();
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
    NotificationMessage.curNotificationObj = null;
  }
}
