export default class NotificationMessage {
  constructor(message = '', {duration = 1000, type = 'success'} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  get template() {
    return `
      <div class="notification notification_${this.type} show">
        <div class="notification__content"> ${this.message}</div>
      </div>
    `;
  }

  setTimer() {
    setTimeout(() => {
      this.destroy();
    }, this.duration);
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.currentNotification) NotificationMessage.currentNotification.destroy();
    target.append(this.element);
    clearTimeout(NotificationMessage.timer);
    NotificationMessage.timer = this.setTimer();
    NotificationMessage.currentNotification = this;
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    NotificationMessage.currentNotification = null;
  }
}
