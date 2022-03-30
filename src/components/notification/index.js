export default class NotificationMessage {

  static activeNotification;

  constructor(
    text = "",
    {
      duration = 2000,
      type = 'success'
    } = {}) {
    this.text = text
    this.duration = duration
    this.type = type
    this.render();
  }

  getTemplate() {
    return `
    <div class="notification notification_${this.type} show" style="--value:${this.duration /1000}s">
      <div class="timer"></div>
      <div class="inner-wrapper">
        <img src = "../../assets/icons/checked.png" width = "30px" style ="margin-right: 15px"  alt ="checked" />
        <div class="notification-body">${this.text}</div>
      </div>
    </div>`;
  }

  show(targetTag = document.body) {
    if (NotificationMessage.activeNotification) {
      NotificationMessage.activeNotification.remove()
    }

    targetTag.append(this.element);

    setTimeout(() => {this.remove()}, this.duration)

    NotificationMessage.activeNotification = this;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.activeNotification = null;
  }

  render () {
    const element = document.createElement(`div`);
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }
}

