export default class Notification {
  static activeNotification;

  root = document.querySelector('body');
  timeId;

  constructor(message = '', {
    duration = 5000,
    type = 'success', // success error warning
  } = {}) {
    this.message = message;
    this.duration = duration;
    this.durationInSecond = (duration / 1000);
    this.type = type;

    this.render();
  }

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
  }

  show(root = this.root) {
    if (Notification.activeNotification) {
      Notification.activeNotification.remove();
    }

    root.append(this.element);
    this.timeId = setTimeout(() => {
      this.remove();
    }, this.duration);

    Notification.activeNotification = this;
  }

  get template() {
    return `
          <div class="notification ${this.type}" style="--value:${this.durationInSecond}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
              <div class="notification-header"></div>
              <div class="notification-body">
                ${this.message}
              </div>
            </div>
          </div>
     `;
  }

  remove () {
    clearTimeout(this.timeId);
    this.element.remove();
  }

  destroy () {
    this.remove();
    Notification.activeNotification = null;
  }
}
