export default class NotificationMessage {

  static activeNotification;

  constructor(str, {
    duration = 0,
    type = '',
  } = {}) {
    this.duration = duration;
    this.type = type;
    this.message = str;

    this.element = this.render();
  }

  getTemplate() {
    return `
    <div class="notification ${this.type}" style="--value:${this.duration/1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
    </div>
    `;
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();

    return wrapper.firstElementChild;
  }

  show (parent = document.body) {
    if (NotificationMessage.activeNotification){
      NotificationMessage.activeNotification.remove();
    }
    parent.append(this.element);

    setTimeout(() => this.remove(), this.duration);

    NotificationMessage.activeNotification = this;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
